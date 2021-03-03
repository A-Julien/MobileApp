import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ListDB, ListService, TodoDbId} from '../../services/list.service';
import {ModalController} from '@ionic/angular';
import {CreateTodoComponent} from '../../modals/create-todo/create-todo.component';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.page.html',
  styleUrls: ['./list-details.page.scss'],
})
export class ListDetailsPage implements OnInit {
  listID: string;
  listName: string;
  public list: Observable<ListDB>;
  public todos: Observable<TodoDbId[]>;

  constructor(private route: ActivatedRoute, private listService: ListService, public modalController: ModalController) { }

  ngOnInit() {
    this.listID = this.route.snapshot.paramMap.get('listId');
    this.list = this.listService.getOneDB(this.listID);
    this.todos = this.list.pipe(
        map(list => {
          return list.todos;
        })
    );
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CreateTodoComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        // @ts-ignore
        listId : this.listID
      }
    });
    return await modal.present();
  }

    delete(todo: TodoDbId, listId) {
        console.log(todo.id, listId);
        this.listService.deleteTodo(todo, listId);
    }
}
