import { Injectable } from '@angular/core';
import {List} from '../models/list';
import {AuthenticationService} from './authentification.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable, Subject} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {PopupService} from './popup.service';
import firebase from 'firebase';

export interface TodoDbId extends TodoDB{
  id: string;
}

export interface TodoDB {
  name: string;
  content: string;
  isDone: boolean;
}

export interface ListDB {
  name: string;
  owner: string;
  share: boolean;
  owners: string[];
}

export interface ListDBExtended extends ListDB {
  id: string;
  todos: TodoDbId[];
  ownerID: string[];
}

export interface SharingNotif {
  id: string;
  newOwner: string;
  owner: string;
  listID: string;
  notify: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private readonly LISTCOLLECTION = '/List';
  private readonly SHARECOLLECTION = '/Share';

  private listCollection: AngularFirestoreCollection<ListDB>;
  private sharingCollection: AngularFirestoreCollection<SharingNotif>;
  private lists: List[];

  constructor(private fireStore: AngularFirestore,
              private authService: AuthenticationService,
              private popupService: PopupService) {
    this.lists = new Array<List>();
    this.listCollection = this.fireStore.collection(this.LISTCOLLECTION,
                ref => ref.where('owners', 'array-contains-any',
                    [this.authService.getUserId(), this.authService.getUserEmail()]));

    this.sharingCollection = this.fireStore.collection(this.SHARECOLLECTION,
        ref => ref.where('newOwner', '==', this.authService.getUserEmail()));
  }

  getAllSharedListDB(): Observable<SharingNotif[]> {
    return this.sharingCollection.snapshotChanges().pipe(
        map(data => this.convertSnapData<SharingNotif>(data))
    );
  }

   getAllListDB(): Observable<ListDBExtended[]> {
    return this.listCollection.snapshotChanges().pipe(
        map(data => this.convertSnapData<ListDB>(data))
    );
  }

  private convertSnapData<T>(datas){
    return datas.map( res => {
      const data = res.payload.doc.data();
      const id = res.payload.doc.id;
      return {id, ...data } as T;
    });

  }
  public getAll(): List[] {
    return this.lists;
  }

  public getOneDB(id: string): Observable<ListDBExtended>{
    return this.listCollection.doc<ListDBExtended>(id).valueChanges()
        .pipe(switchMap(list =>
            this.listCollection.doc(id).collection<TodoDB>('todos').snapshotChanges().pipe(
                map(data => {
                  list.todos = this.convertSnapData<TodoDbId>(data);
                  return list;
                })
            )
        ));
  }

  public getOneTodo(listID: string, todoId: string): Observable<TodoDbId> {
    return this.listCollection.doc<ListDBExtended>(listID).collection<TodoDbId>('todos').doc(todoId).valueChanges();
  }

  public getOne(id: string): List {
    return this.lists.find(list => list.id === id);
  }

  public createList(list: List): void {
    const l: ListDB = { name : list.name, share: false, owner: this.authService.getUserEmail(), owners: []};
    const addList = this.fireStore.collection('/List');
    addList.add(l).then((newList) => {
      addList.doc(newList.id).update({
        owners: firebase.firestore.FieldValue.arrayUnion(this.authService.getUserId())
      })
          .then(() => this.popupService.presentToast(list.name + 'create'))
          .catch(() => this.popupService.presentAlert('error when created ' + list.name));
    }).catch(() => this.popupService.presentAlert('error when created ' + list.name));

   /* this.listCollection.add(l)
        .then(() => this.popupService.presentToast(list.name + 'create'))
        .catch(() => this.popupService.presentAlert('error when created ' + list.name));*/

  }

  public shareList(list: ListDBExtended, userEmail: string): Promise<any> {
    console.log(list.id, '  ', userEmail);
    this.fireStore.collection(this.LISTCOLLECTION).doc(list.id).update({
      share: true,
      owners: firebase.firestore.FieldValue.arrayUnion(userEmail)
    });
    return this.creatSharingNotif(userEmail, list.id);
  }

  private creatSharingNotif(emailUser: string, listNameUser: string): Promise<any>{
    return this.fireStore.collection(this.SHARECOLLECTION).add({
      newOwner: emailUser,
      owner: this.authService.getUserEmail(),
      listID: listNameUser,
      notify: false
    });
  }

  deleteList(list: ListDBExtended): void {
    if (list.owner !== this.authService.getUserEmail()) {
      this.popupService.presentToast('Can not delete list that doesn\'t belong to you');
      return;
    }
    const delCol = this.fireStore.collection(this.LISTCOLLECTION);
    if (list.share){
      let sharing = true;
      let o = this.authService.getUserEmail();
      if (list.owners.length === 2) {
        sharing = false;
        list.owners.forEach((ow) => {
          if (ow !== o){ o = ow; }
        });
      }
      delCol.doc(list.id).update({
        owner: o,
        share: sharing,
        owners: firebase.firestore.FieldValue.arrayRemove(this.authService.getUserEmail())
      }).then(() => {
        this.getAllSharedListDB().subscribe((sl) => {
          sl.forEach((l) => {
            if ((l.owner === this.authService.getUserEmail() || l.newOwner === this.authService.getUserEmail() ) && l.listID === list.id) {
              this.sharingCollection.doc(l.id).delete();
            }
          });
        });
      });
      return;
    }
    this.listCollection.doc<ListDBExtended>(list.id).delete()
        .then(() => this.popupService.presentToast('list ' + list.name + ' removed'))
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + list.name));
    return;
    /*if (list.share || !list.owner) {
      this.listCollection.doc(list.id).update({
        owners: firebase.firestore.FieldValue.arrayRemove(this.authService.getUserEmail())
      });
    }
    if (!list.share || list.owner){
      this.listCollection.doc<ListDBExtended>(list.id).delete()
          .then(() => this.popupService.presentToast('list ' + list.name + ' removed'))
          .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + list.name));
      return;
    }*/
  }

  public removeSharedUser(userEmailToRm: string, list: ListDBExtended) {
    if (userEmailToRm === this.authService.getUserEmail()){ console.log('nope'); }
    if (list.owner !== this.authService.getUserEmail()) { console.log('nope'); }

    const delCol = this.fireStore.collection(this.LISTCOLLECTION);
    let sharing = true;

    let o = this.authService.getUserEmail();
    if (list.owners.length === 2) {
      sharing = false;
      list.owners.forEach((ow) => {
        if (ow !== o) { o = ow; }
      });
    }

    delCol.doc(list.id).update({
        share: sharing,
        owners: firebase.firestore.FieldValue.arrayRemove(userEmailToRm)
      }).then(() => {
        this.getAllSharedListDB().subscribe((sl) => {
          sl.forEach((l) => {
            if (l.newOwner === userEmailToRm && l.listID === list.id) {
              this.sharingCollection.doc(l.id).delete();
            }
          });
        });
      });
  }

  deleteTodo(todo: TodoDbId, listId: string) : void {
    this.listCollection.doc(listId).collection('todos').doc<TodoDB>(todo.id).delete()
        .then(() => this.popupService.presentToast('list ' + todo.name + ' removed'))
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + todo.name));
  }

creatTodo(todo: TodoDB, listId) : void {
    this.listCollection.doc(listId).collection('todos').add(todo)
        .then(() => {
          this.popupService.presentToast(todo.name + ' added');
        })
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + todo.name));
  }
}
