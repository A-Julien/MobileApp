import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CreateListComponent } from '../../modals/create-list/create-list.component';
import {List} from '../../models/list';
import {ListDBExtended, ListService} from '../../services/list.service';
import {Observable} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  lists: Observable<ListDBExtended[]>;

  constructor(private listService: ListService, public modalController: ModalController) {
    this.lists = this.listService.getAllDB();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CreateListComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  delete(listId: string, listName: string): void {
    this.listService.deleteList(listId, listName);
  }
}
