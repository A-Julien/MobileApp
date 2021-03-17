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
import {Updater} from '../../models/updater';


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
  todosToRm: Updater[];
  todosToUpdate: Updater[];



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
    this.todosToRm = [];
    this.todosToUpdate = [];
    this.listID = this.route.snapshot.paramMap.get('listId');
    this.list = this.listService.getOneDB(this.listID);
    this.todos = this.list.pipe(
        map(list => {
          return list.todos;
        })
    );
    this.todos.subscribe(() => this.showLoader = false);

    this.listService.listShare.subscribe( data => {
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
      cssClass:  ['add-modal-todo'],
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
    const nbTodos =  this.todosToUpdate.length;

    let msg = 'Update Name of ' + nbTodos + ' todo';
    if ( nbTodos > 1) { msg = 'Update Name of ' + nbTodos + ' Todos'; }
    const loader = await this.popUpService.presentLoading(msg);

    this.todosToUpdate.forEach(u => {
      console.log('update todo ', u.field);
      this.updateTodoName(u);
    });
    this.todosToUpdate = [];

    await loader.dismiss();

  }

  async updateTodoName(u: Updater){
    await this.listService.updateTodoName(u, this.listID);
  }

  addToDel(todo: Todo){
    const index = this.todosToUpdate.findIndex(t => t.id === todo.id);
    if (index !== -1){
      this.todosToRm = this.todosToRm.filter(t => t.id !== todo.id);
      return;
    }
    this.todosToRm.push(new Updater(todo.id, todo.name));
  }

  delete(u: Updater, listId) {
      this.listService.deleteTodo(u, listId);
  }


  async delSelect() {
    const nbTodos = this.todosToRm.length;
    let msg = 'deleting ' + nbTodos + ' todo';
    if ( nbTodos > 1) { msg = 'Deleting ' + nbTodos + ' Todos'; }
    const loader = await this.popUpService.presentLoading(msg);

    this.todosToRm.forEach(todo => {
      this.delete(todo, this.listID);
    });
    this.todosToRm = [];
    await loader.dismiss();
  }

  routeToDetail(TodoId: string) {
    if (!this.editing) { this.router.navigate(['/list-details/' + this.listID + '/todo-details/' + TodoId]); }
  }

  addToUpdateTodoName(todo: Todo): void {
    console.log(this.todosToUpdate.length);
    const index = this.todosToUpdate.findIndex(t => t.id === todo.id);
    if (index !== -1){
      this.todosToUpdate[index].field = todo.name;
      return;
    }
    this.todosToUpdate.push(new Updater(todo.id, todo.name));
  }
}
