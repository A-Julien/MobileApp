import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { ListService} from '../../services/list.service';
import {ModalController} from '@ionic/angular';
import {CreateTodoComponent} from '../../modals/create-todo/create-todo.component';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {List} from '../../models/list';
import {Todo} from '../../models/todo';
import {AuthenticationService} from '../../services/authentification.service';


@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.page.html',
  styleUrls: ['./list-details.page.scss'],
})
export class ListDetailsPage implements OnInit {
  listID: string;
  listName: string;
  showLoader = true;

  public list: Observable<List>;
  public todos: Observable<Todo[]>;

  constructor(
      private route: ActivatedRoute,
      private listService: ListService,
      public modalController: ModalController,
      private auth: AuthenticationService)
  { }

  ngOnInit() {
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

  delete(todo: Todo, listId) {
      console.log(todo.id, listId);
      this.listService.deleteTodo(todo, listId);
  }
}
