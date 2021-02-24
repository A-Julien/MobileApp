import { Injectable } from '@angular/core';
import {List} from '../models/list';
import {Todo} from '../models/todo';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  private lists: List[];

  constructor() {
    this.lists = new Array<List>();
  }

  public getAll(): List[] {
    return this.lists;
  }

  public getOne(id: string): List {
    return this.lists.find(list => list.id === id);
  }

  public create(list: List): void {
    this.lists.push(list);
  }

  deleteList(list: List): void {
    this.lists.splice(this.lists.indexOf(list), 1);
  }

  deleteTodo(todo: Todo, listId): void {
    this.getOne(listId).todosList.splice(this.getOne(listId).todosList.indexOf(todo), 1);
  }

  addTodo(todo: Todo, listId): void {
    this.getOne(listId).todosList.push(todo);
  }
}
