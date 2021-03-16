import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { ListService} from '../../services/list.service';
import {ModalController} from '@ionic/angular';
import {CreateTodoComponent} from '../../modals/create-todo/create-todo.component';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {List} from '../../models/list';
import {Todo} from '../../models/todo';
import {AuthenticationService} from '../../services/authentification.service';
import {PopupService} from '../../services/popup.service';


@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.page.html',
  styleUrls: ['./list-details.page.scss'],
})
export class ListDetailsPage implements OnInit {
  listID: string;
  listName: string;
  showLoader = true;

  editing = false;
  TodosToRm: Todo[];
  TodosToUpdate: Todo[];



  public list: Observable<List>;
  public todos: Observable<Todo[]>;

  constructor(
      private route: ActivatedRoute,
      private listService: ListService,
      public modalController: ModalController,
      private auth: AuthenticationService,
      private popUpService: PopupService,
      private router: Router)
  { }

  ngOnInit() {
    this.TodosToRm = [];
    this.TodosToUpdate = [];
    this.listID = this.route.snapshot.paramMap.get('listId');
    this.list = this.listService.getOneDB(this.listID);
    this.todos = this.list.pipe(
        map(list => {
          return list.todos;
        })
    );
    this.todos.subscribe(() => this.showLoader = false);

    this.listService.getAllSharedListDB().subscribe( data => {
      data.forEach(d => {
        if (d.listID === this.listID && d.newOwner === this.auth.userEmail && !d.notify){
          this.listService.removedNotyficationShared(d);
          return;
        }
      });
    });
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CreateTodoComponent,
      cssClass:  ['share-modal'],
      componentProps: {
        // @ts-ignore
        listId : this.listID
      }
    });
    return await modal.present();
  }

  startEdit() { this.editing = true; }

  async stopEdit() {
    this.editing = false;
    const nbTodos =  this.TodosToUpdate.length;

    let msg = 'Update Name of ' + nbTodos + ' todo';
    if ( nbTodos > 1) { msg = 'Update Name of ' + nbTodos + ' Todos'; }
    const loader = await this.popUpService.presentLoading(msg);

    this.TodosToUpdate.forEach(todo => {
      console.log('update todo ', todo.name);
      this.updateTodos(todo, this.listID);
    });
    this.TodosToUpdate = [];

    await loader.dismiss();

  }

  addToDel(todo: Todo){
    if (this.TodosToRm.indexOf(todo) !== -1){
      this.TodosToRm = this.TodosToRm.filter(t => t !== todo);
      return;
    }
    this.TodosToRm.push(todo);
  }

  delete(todo: Todo, listId) {
      console.log(todo.id, listId);
      this.listService.deleteTodo(todo, listId);
  }

  async updateTodos(todo: Todo, listId) {
    console.log(todo.id, listId);
    await this.listService.updateTodo(todo, listId);
  }

  async delSelect() {
    const nbTodos = this.TodosToRm.length;
    let msg = 'deleting ' + nbTodos + ' todo';
    if ( nbTodos > 1) { msg = 'Deleting ' + nbTodos + ' Todos'; }
    const loader = await this.popUpService.presentLoading(msg);

    this.TodosToRm.forEach(todo => {
      console.log('delete todo ', todo.name);
      this.delete(todo, this.listID);
    });
    this.TodosToRm = [];
    await loader.dismiss();
  }

  routeToDetail(TodoId: string) {
    if (!this.editing) { this.router.navigate(['/list-details/' + this.listID + '/todo-details/' + TodoId]); }
  }

  addToUpdateTodos(todo: Todo): void {
    const index = this.TodosToUpdate.indexOf(todo);
    if (index !== -1){
      this.TodosToUpdate[index] = todo;
      return;
    }
    this.TodosToUpdate.push(todo);
  }
}
