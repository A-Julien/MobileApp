import {Component, OnInit } from '@angular/core';
import {
  AlertController,
  ModalController,
  IonItemSliding,
  PopoverController
} from '@ionic/angular';
import { CreateListComponent } from '../../modals/create-list/create-list.component';
import { ListService} from '../../services/list.service';
import {Observable} from 'rxjs';
import {PopupService} from '../../services/popup.service';
import {List} from '../../models/list';
import {ManageSharingComponent} from '../../modals/manage-sharing/manage-sharing.component';
import {AuthenticationService} from '../../services/authentification.service';
import { map } from 'rxjs/operators';
import {MetaList} from '../../models/metaList';
import {PhotoService} from '../../services/photo.service';
import {OcrProviderService} from '../../services/ocr-provider.service';
import { Plugins } from '@capacitor/core';
import {Router} from '@angular/router';
import {ShareHistoryComponent} from '../../popOvers/share-history/share-history.component';
import {Updater} from '../../models/updater';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  lists: Observable<List[]>;
  listsShared: Observable<MetaList[]>;
  showLoading = true;

  editing = false;
  listToRm: List[];
  listToUpdateName: Updater[];

  nbNotif: number;
  private metalist: MetaList[];

  constructor(private listService: ListService,
              private modalController: ModalController,
              private alertController: AlertController,
              private popUpService: PopupService,
              public auth: AuthenticationService,
              private photoService: PhotoService,
              private popOverController: PopoverController,
              private router: Router
  ){
    this.nbNotif = 0;
    this.listToRm = [];
    this.listToUpdateName = [];

    this.lists = this.listService.lists.pipe(
        map(list => {
          list.forEach(l => l.isChecked = false);
          return list;
        })
    );
    // this.lists.subscribe((l) => l.forEach((ll) => console.log(ll.owner)));

    this.listsShared = this.listService.listShare;
    this.listsShared.subscribe(ml => {
      this.metalist = ml;
      this.nbNotif = 0;
      ml.forEach(meta => {
        if (!meta.notify && meta.newOwner === this.auth.userEmail){
          this.nbNotif += 1;
        }
      });
    });

    this.lists.subscribe((listArray) => {
      this.showLoading = false;
    });
  }

  ngOnInit(): void {
    this.listsShared = this.listService.listShare;
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CreateListComponent,
      cssClass: ['share-modal']
    });
    return await modal.present();
  }

  isNewList(listId: string) {
    let res = false;
    this.metalist.forEach( ml => {
      if (ml.listID === listId && !ml.notify && ml.newOwner === this.auth.userEmail) { res =  true; }
    });
    return res;
  }

  async delete(list: List) {
    await this.listService.deleteList(list);
  }

  public async share(list: List, slidingItem: IonItemSliding) {
    if (list.owner !== this.auth.userId) {
      this.popUpService.presentToast('can not share a list that don\'t belong to you');
      return;
    }
    const modal = await this.modalController.create({
      component: ManageSharingComponent,
      cssClass: ['share-modal'],
      componentProps: {
        listParam: list,
      }
    });
    modal.present().then(() => slidingItem.close());
  }

  public isNew(list: List): Observable<MetaList> {
   return this.listsShared.pipe(
        map(data => {
          return data.find( d => d.listID === list.id && d.owner !== this.auth.userEmail);
        })
    );
  }

  routeToTodos(id: string){
    if (!this.editing) { this.router.navigate(['/list-details/' + id]); }
  }

  startEdit() { this.editing = true; }

  async stopEdit() {
    this.editing = false;
    const nbList =  this.listToUpdateName.length;

    let msg = 'Update Name of ' + nbList + ' list';
    if ( nbList > 1) { msg = 'Update Name of ' + nbList + ' lists'; }
    const loader = await this.popUpService.presentLoading(msg);

    this.listToUpdateName.forEach(u => {
      this.updateListName(u);
    });
    this.listToUpdateName = [];

    await loader.dismiss();
  }

  async updateListName(u: Updater){
    await this.listService.updateListName(u);
  }

  addToDel(list: List){
    if (this.listToRm.indexOf(list) !== -1){
      this.listToRm = this.listToRm.filter(l => l !== list);
      return;
    }
    this.listToRm.push(list);
  }

  async delSelect() {
    let msg = 'deleting ' + this.listToRm.length + ' list';
    if ( this.listToRm.length > 1) { msg = 'deleting ' + this.listToRm.length + ' lists'; }
    const loader = await this.popUpService.presentLoading(msg);
    this.listToRm.forEach( list => {
        console.log('delete list ', list.name);
        this.delete(list);
    });
    await loader.dismiss();
  }

  async popShareHistory(ev) {
      const popover = await this.popOverController.create({
        component: ShareHistoryComponent,
        cssClass: 'notif',
        event: ev,
        mode: 'ios',
        translucent: true
      });
      return await popover.present();
  }

  addToUpdateListName(list: List) {
    const index = this.listToUpdateName.findIndex(l => l.id === list.id);
    if (index !== -1){
      this.listToUpdateName[index].field = list.name;
      return;
    }
    this.listToUpdateName.push(new Updater(list.id, list.name));
  }
}
