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
import {MetaList, MetaListToFirebase} from '../models/metaList';
import {Updater} from '../models/updater';

/*
export interface SharingNotif {
  id: string;
  newOwner: string;
  owner: string;
  listID: string;
  notify: boolean;
}*/

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private readonly LISTCOLLECTION = '/List';
  private readonly SHARECOLLECTION = '/Share';

  private listCollection: AngularFirestoreCollection<List>;
  private sharingCollection: AngularFirestoreCollection<MetaList>;
  private lists: List[];

  constructor(private afs: AngularFirestore,
              private auth: AuthenticationService,
              private popupService: PopupService) {
    this.lists = new Array<List>();
    /*this.listCollection = this.afs.collection<List>(this.LISTCOLLECTION,
        ref => ref.where('owners', 'array-contains-any',
            [this.auth.userEmail, this.auth.userId]));*/
    this.listCollection = this.afs.collection<List>(this.LISTCOLLECTION);

    this.sharingCollection = this.afs.collection(this.SHARECOLLECTION);
    /*this.sharingCollection = this.afs.collection(this.SHARECOLLECTION,
        ref => ref.where('newOwner', '==', this.auth.userEmail));*/

  }


  getAllSharedListDB(): Observable<MetaList[]> {
    return this.auth.authState.pipe(
        switchMap(user => this.afs.collection(this.SHARECOLLECTION, ref => ref.where('newOwner', '==', user.email)).snapshotChanges()),
        map(actions => this.convertSnapData<List>(actions))
    );
  }

   getAllListDB(): Observable<List[]> {
     return this.auth.authState.pipe(
         switchMap(user => this.afs.collection(this.LISTCOLLECTION, ref => ref.where('owners', 'array-contains-any',
             [user.email, user.uid])).snapshotChanges()),
         map(actions => this.convertSnapData<List>(actions))
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

  public getOneList(id: string): Observable<List>{
    return this.listCollection.doc<List>(id).valueChanges();
  }

  public getOneTodo(listID: string, todoId: string): Observable<Todo> {
    return this.listCollection.doc(listID).collection<Todo>('todos').doc(todoId).get().pipe(
        map( data => {
          const todo: Todo = { id: data.id, ...data.data() as Todo };
          return todo;
        })
    );
  }

  public getOne(id: string): List {
    return this.lists.find(list => list.id === id);
  }

  public async createList(list: List): Promise<void> {
    list.owners.push(this.auth.userEmail);
    list.owner = this.auth.userId;

    this.listCollection.ref.withConverter(listToFirebase).add(list)
        .then(() => this.popupService.presentToast(list.name + 'create'))
        .catch(() => this.popupService.presentAlert('error when created ' + list.name));
  }

  public shareList(list: List, userEmail: string): Promise<any> {
    console.log(list.id, '  ', userEmail);
    if (list.owner !== this.auth.userId) {
      this.popupService.presentToast('can not share a list that don\'t belong to you');
      return;
    }
    this.afs.collection(this.LISTCOLLECTION).doc(list.id).update({
      share: true,
      owners: firebase.firestore.FieldValue.arrayUnion(userEmail)
    });
    return this.creatSharingNotif(userEmail, list);
  }

  private creatSharingNotif(emailUser: string, lisToShare: List): Promise<any>{
    return this.afs.collection(this.SHARECOLLECTION).add({
      newOwner: emailUser,
      owner: this.auth.userEmail,
      listID: lisToShare.id,
      listName: lisToShare.name,
      notify: false
    });
  }

  public async deleteList(list: List): Promise<void> {

    if (list.owner === this.auth.userId){
      this.listCollection.doc(list.id).delete()
          .then(() => this.popupService.presentToast('list ' + list.name + ' removed'))
          .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + list.name));
      this.removedSharedList(list.id);
      return;
    }

    if (list.share){
      list.owners = list.owners.filter(u => u !== this.auth.userEmail);
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

  public removedNotyficationShared(share: MetaList){
    share.notify = true;
    this.sharingCollection.doc(share.id).ref.withConverter(MetaListToFirebase).set(share);
  }

  public async removeSharedUser(userEmailToRm: string, list: List) {
    if (userEmailToRm === this.auth.userEmail){
      console.log('nope');
      return;
    }
    if (list.owner !== this.auth.userId) {
      console.log('nope');
      return;
    }

    list.owners = list.owners.filter(u => u !== userEmailToRm);
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

  public updateListName(u: Updater): Promise<void> {
    return this.listCollection.doc(u.id).update({name: u.field});
  }

  public updateTodo(todo: Todo, listID: string): Promise<void>{
    return this.listCollection.doc(listID).collection('todos').doc(todo.id).ref.withConverter(todoToFirebase).set(todo);
  }
  public updateTodoName(u: Updater, listID: string): Promise<void>{
    return this.listCollection.doc(listID).collection('todos').doc(u.id).update({name: u.field});
  }

  deleteTodo(u: Updater, listId: string): void {
    this.listCollection.doc(listId).collection('todos').doc(u.id).delete()
        .then(() => this.popupService.presentToast('list ' + u.field + ' removed'))
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + u.field));
  }

  creatTodo(todo: Todo, listId): void {
    this.listCollection.doc(listId).collection('todos').ref.withConverter(todoToFirebase).add(todo)
        .then(() =>  this.popupService.presentToast(todo.name + ' added'))
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + todo.name));
  }


}
