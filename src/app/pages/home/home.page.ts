import { Component } from '@angular/core';
import {AlertController, ModalController, IonItemSliding} from '@ionic/angular';
import { CreateListComponent } from '../../modals/create-list/create-list.component';
import {ListDBExtended, ListService} from '../../services/list.service';
import {Observable} from 'rxjs';
import {PopupService} from '../../services/popup.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  lists: Observable<ListDBExtended[]>;
  showLoading = true;
  constructor(private listService: ListService,
              private modalController: ModalController,
              private alertController: AlertController,
              private popupService :PopupService) {
    this.lists = this.listService.getAllListDB();
    this.lists.subscribe(() => this.showLoading = false);
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


  public async share(list: ListDBExtended, slidingItem: IonItemSliding) {
    const alert = await this.alertController.create({
      header: 'Sharing List ',
      message: 'Share list \"' + list.name + '\" with another user : ',
      inputs: [
        {
          name: 'email',
          placeholder: 'email@todo.com'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
            slidingItem.close();
          }
        },
        {
          text: 'Share',
          handler: data => {
            this.listService.shareList(list.id, data.email)
                .then(() => this.popupService.presentToast(list.name + ' shared with ' + data.email + '!'))
                .catch(() => this.popupService.presentToast('Error, ' + list.name + ' not shared'))
                .finally(() => slidingItem.close());
          }
        }
      ]
    });
    await alert.present();
  }
}
