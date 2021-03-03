import { Injectable } from '@angular/core';
import {List} from '../models/list';
import {Todo} from '../models/todo';
import {AuthenticationService} from './authentification.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {ToastController} from '@ionic/angular';
import firebase from 'firebase';
import database = firebase.database;

export interface TodoDB {
  name: string;
  content: string;
  isDone: boolean;
}

export interface ListDB extends ListDBtoPush {
  id: string;
  todos: TodoDB[];
}

export interface ListDBtoPush  {
  name: string;
  userID: string;
}

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private listCollection: AngularFirestoreCollection<ListDBtoPush>;
  private lists: List[];

  constructor(private fireStore: AngularFirestore,
              private authService: AuthenticationService,
              private toastController: ToastController) {
    this.lists = new Array<List>();
    this.listCollection = this.fireStore.collection('/Lists', ref => ref.where('userID', '==', this.authService.getUserId()));
   }

   getAllDB(): Observable<ListDB[]> {
    return this.listCollection.snapshotChanges().pipe(
        map(data => this.convertSnapData<ListDBtoPush>(data))
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

  public getOneDB(id: string): Observable<ListDB>{
    return this.listCollection.doc<ListDB>(id).valueChanges()
        .pipe(switchMap(list =>
          this.listCollection.doc(id).collection<TodoDB>('todos').snapshotChanges().pipe(
              map(data => {
                list.todos = this.convertSnapData<TodoDB>(data);
                console.log('GET TODO', list.todos);
                return list;
              })
          )
        ));
  }

  public getOneTodo(listID: string, todoId: string): Observable<TodoDB> {
    return this.listCollection.doc<ListDB>(listID).collection<TodoDB>('todos').doc(todoId).snapshotChanges().pipe(
        map( data => {
          return  this.convertSnapData(data);
        })
    );
  }

  public getOne(id: string): List {
    return this.lists.find(list => list.id === id);
  }

  public create(list: List): void {
    const l: ListDBtoPush = { name : list.name, userID : this.authService.getUserId()};
    this.lists.push(new List(name));
    this.listCollection.add(l);
    /*this.userDoc.set({
      name: list.name
    });*/
  }
  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 5000
    });
    toast.present();
  }

  deleteList(listID: string, listName: string): void {
    this.listCollection.doc<ListDB>(listID).delete()
        .then(() => this.presentToast('list ' + listName + ' removed'))
        .catch(() => this.presentToast('An error was occurred can not delete ' + listName));
    // this.lists.splice(this.lists.indexOf(list), 1);
  }

  deleteTodo(todo: Todo, listId): void {
    this.getOne(listId).todosList.splice(this.getOne(listId).todosList.indexOf(todo), 1);
  }

  /*
  return this.listCollection.doc<ListDB>(id).valueChanges()
        .pipe(switchMap(list =>
          this.listCollection.doc(id).collection<TodoDB>('todos').snapshotChanges().pipe(
              map(data => {
                list.todos = this.convertSnapData<TodoDB>(data);

                return list;
              })
          )
        ));
   */
  addTodo(todo: TodoDB, listId): void {
// Atomically add a new region to the "regions" array field.
    /*this.listCollection.doc(listId).collection('todos').doc().update({
      todos: firebase.firestore.FieldValue.arrayUnion(todo)
    });
    console.log("g=tg");
    let ref = _this.db.collection('/users').doc(_this.userId).collection('/invoices').ref.doc().id;
    console.log('ref: ' + ref);

    this.db.collection('test2').ref.doc('myDoc1').collection(`/${this.myFolder}`).add(imagen);

    */
    const ref = this.listCollection.doc(listId).ref.id;

    console.log('MY LIST ID', listId, ' ', ref);

    this.listCollection.doc(listId).collection('todos').add(todo)
        .then(() => {
          this.presentToast(todo.name + ' added');
        })
        .catch(() => this.presentToast('An error was occurred can not delete ' + todo.name));
  }
}
