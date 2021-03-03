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

export interface TodoDbId extends TodoDB{
  id: string;
}

export interface TodoDB {
  name: string;
  content: string;
  isDone: boolean;
}

export interface ListDB extends ListDBtoPush {
  id: string;
  todos: TodoDbId[];
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
                list.todos = this.convertSnapData<TodoDbId>(data);
                return list;
              })
          )
        ));
  }

  public getOneTodo(listID: string, todoId: string): Observable<TodoDbId> {
    return this.listCollection.doc<ListDB>(listID).collection<TodoDbId>('todos').doc(todoId).valueChanges();
  }

  public getOne(id: string): List {
    return this.lists.find(list => list.id === id);
  }

  public createList(list: List): void {
    const l: ListDBtoPush = { name : list.name, userID : this.authService.getUserId()};
    this.lists.push(new List(name));
    this.listCollection.add(l);
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
  }

  deleteTodo(todo: TodoDbId, listId: string): void {
    this.listCollection.doc(listId).collection('todos').doc<TodoDB>(todo.id).delete()
        .then(() => this.presentToast('list ' + todo.name + ' removed'))
        .catch(() => this.presentToast('An error was occurred can not delete ' + todo.name));
  }

  creatTodo(todo: TodoDB, listId): void {
    const ref = this.listCollection.doc(listId).ref.id;

    console.log('MY LIST ID', listId, ' ', ref);

    this.listCollection.doc(listId).collection('todos').add(todo)
        .then(() => {
          this.presentToast(todo.name + ' added');
        })
        .catch(() => this.presentToast('An error was occurred can not delete ' + todo.name));
  }
}
