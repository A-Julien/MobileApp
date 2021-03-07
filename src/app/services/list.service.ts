import { Injectable } from '@angular/core';
import {List, listToFirebase} from '../models/list';
import {AuthenticationService} from './authentification.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable, Subject} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {PopupService} from './popup.service';
import firebase from 'firebase';
import {userError} from '@angular/compiler-cli/src/transformers/util';
import {Todo, todoToFirebase} from '../models/todo';


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

  private listCollection: AngularFirestoreCollection<List>;
  private sharingCollection: AngularFirestoreCollection<SharingNotif>;
  private lists: List[];

  constructor(private fireStore: AngularFirestore,
              private auth: AuthenticationService,
              private popupService: PopupService) {
    this.lists = new Array<List>();
    this.listCollection = this.fireStore.collection<List>(this.LISTCOLLECTION,
        ref => ref.where('owners', 'array-contains-any',
            [this.auth.getUserEmail(), this.auth.getUserId()]));

    this.sharingCollection = this.fireStore.collection(this.SHARECOLLECTION,
        ref => ref.where('newOwner', '==', this.auth.getUserEmail()));

  }


  getAllSharedListDB(): Observable<SharingNotif[]> {
    return this.sharingCollection.snapshotChanges().pipe(
        map(data => this.convertSnapData<SharingNotif>(data))
    );
  }

   getAllListDB(): Observable<List[]> {
    return this.listCollection.snapshotChanges().pipe(
        map(data => this.convertSnapData<List>(data))
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

  public getOneDB(id: string): Observable<List>{
    return this.listCollection.doc(id).valueChanges()
        .pipe(switchMap(list =>
            this.listCollection.doc(id).collection<Todo>('todos').snapshotChanges().pipe(
                map(data => {
                  list.todos = this.convertSnapData<Todo>(data);
                  return list;
                })
            )
        ));
  }

  public getOneTodo(listID: string, todoId: string): Observable<Todo> {
    return this.listCollection.doc(listID).collection<Todo>('todos').doc(todoId).valueChanges();
  }

  public getOne(id: string): List {
    return this.lists.find(list => list.id === id);
  }

  public async createList(list: List): Promise<void> {
    list.owners.push(this.auth.getUserId());
    list.owner = this.auth.getUserId();

    this.listCollection.ref.withConverter(listToFirebase).add(list)
        .then(() => this.popupService.presentToast(list.name + 'create'))
        .catch(() => this.popupService.presentAlert('error when created ' + list.name));
  }

  public shareList(list: List, userEmail: string): Promise<any> {
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
      owner: this.auth.getUserEmail(),
      listID: listNameUser,
      notify: false
    });
  }

  public async deleteList(list: List): Promise<void> {

    if (list.owner === this.auth.getUserId()){
      this.listCollection.doc(list.id).delete()
          .then(() => this.popupService.presentToast('list ' + list.name + ' removed'))
          .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + list.name));
      this.removedSharedList(list.id);
      return;
    }

    if (list.share){
      list.owners = list.owners.filter(u => u !== this.auth.getUserEmail());
      if (list.owners.length === 1) { list.share = false; }
    }

    this.updateList(list)
        .then(() => this.popupService.presentToast('list ' + list.name + ' removed'))
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + list.name));
    this.removedSharedList(list.id);
  }

  private removedSharedList(listID: string){
    this.getAllSharedListDB().subscribe((sl) => {
      sl.forEach((l) => {
        if (l.listID === listID) { this.sharingCollection.doc(l.id).delete(); }
      });
    });
  }

  public async removeSharedUser(userEmailToRm: string, list: List) {
    if (userEmailToRm === this.auth.getUserEmail()){ console.log('nope'); }
    if (list.owner !== this.auth.getUserEmail()) { console.log('nope'); }

    list.owners = list.owners.filter(u => u !== this.auth.getUserEmail());
    if (list.owners.length === 1) { list.share = false; }

    this.updateList(list);

    this.getAllSharedListDB().subscribe((sl) => {
    sl.forEach((l) => {
        if (l.newOwner === userEmailToRm && l.listID === list.id) {
          this.sharingCollection.doc(l.id).delete();
        }
      });
    });

  }

  private updateList(list: List): Promise<void> {
    return this.listCollection.doc(list.id).ref.withConverter(listToFirebase).set(list);
  }

  deleteTodo(todo: Todo, listId: string): void {
    this.listCollection.doc(listId).collection('todos').doc(todo.id).delete()
        .then(() => this.popupService.presentToast('list ' + todo.name + ' removed'))
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + todo.name));
  }

  creatTodo(todo: Todo, listId): void {
    this.listCollection.doc(listId).collection('todos').ref.withConverter(todoToFirebase).add(todo)
        .then(() =>  this.popupService.presentToast(todo.name + ' added'))
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + todo.name));
  }


}
