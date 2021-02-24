import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {List} from '../../models/list';
import {ListService} from '../../services/list.service';
import {CreateListComponent} from '../../modals/create-list/create-list.component';
import {ModalController} from '@ionic/angular';
import {CreateTodoComponent} from '../../modals/create-todo/create-todo.component';
import {Todo} from '../../models/todo';

@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.page.html',
  styleUrls: ['./list-details.page.scss'],
})
export class ListDetailsPage implements OnInit {

  public list: List;

  constructor(private route: ActivatedRoute, private listService: ListService, public modalController: ModalController) { }

  ngOnInit() {
    const listId = this.route.snapshot.paramMap.get('listId');
    this.list = this.listService.getOne(listId);
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CreateTodoComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        listId : this.list.id
      }
    });
    return await modal.present();
  }

    delete(todo: Todo, listId) {
        this.listService.deleteTodo(todo, listId);
    }
}
