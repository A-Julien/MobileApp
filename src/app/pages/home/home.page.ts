import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CreateListComponent } from '../../modals/create-list/create-list.component';
import {List} from '../../models/list';
import {ListService} from '../../services/list.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  lists: List[];
  constructor(private listService: ListService, public modalController: ModalController) {
    this.lists = listService.getAll();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CreateListComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  delete(list: List): void {
    this.listService.deleteList(list);
  }
}
