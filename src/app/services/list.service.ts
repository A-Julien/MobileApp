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
  owners: firebase.firestore.FieldValue;
}

export interface ListDBExtended extends ListDB {
  id: string;
  todos: TodoDbId[];
}

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private listCollection: AngularFirestoreCollection<ListDB>;
  private lists: List[];

  constructor(private fireStore: AngularFirestore,
              private authService: AuthenticationService,
              private popupService: PopupService) {
    this.lists = new Array<List>();
    this.listCollection = this.fireStore.collection('/Lists',
                ref => ref.where('owners', 'array-contains-any',
                    [this.authService.getUserId(), this.authService.getUserEmail()]));
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
    const l: ListDB = { name : list.name, owners: firebase.firestore.FieldValue.arrayUnion(this.authService.getUserId())};
    this.listCollection.add(l)
        .then(() => this.popupService.presentToast(list.name + 'create'))
        .catch(() => this.popupService.presentAlert('error when created ' + list.name));

  }

  public shareList(listID: string, userEmail: string): Promise<any> {
    console.log(listID, '  ', userEmail);
    const listToShar = this.listCollection.doc(listID);
    return listToShar.update({
      owners: firebase.firestore.FieldValue.arrayUnion(userEmail)
    });
  }


  deleteList(listID: string, listName: string): void {
    this.listCollection.doc<ListDBExtended>(listID).delete()
        .then(() => this.popupService.presentToast('list ' + listName + ' removed'))
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + listName));
  }

  deleteTodo(todo: TodoDbId, listId: string): void {
    this.listCollection.doc(listId).collection('todos').doc<TodoDB>(todo.id).delete()
        .then(() => this.popupService.presentToast('list ' + todo.name + ' removed'))
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + todo.name));
  }

  creatTodo(todo: TodoDB, listId): void {
    this.listCollection.doc(listId).collection('todos').add(todo)
        .then(() => {
          this.popupService.presentToast(todo.name + ' added');
        })
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + todo.name));
  }
}
