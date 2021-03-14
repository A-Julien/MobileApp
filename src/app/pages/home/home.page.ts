import {Component, OnInit, ViewChild} from '@angular/core';
import {
  AlertController,
  ModalController,
  IonItemSliding,
  ActionSheetController,
  PopoverController
} from '@ionic/angular';
import { CreateListComponent } from '../../modals/create-list/create-list.component';
import { ListService} from '../../services/list.service';
import {Observable} from 'rxjs';
import {PopupService} from '../../services/popup.service';
import {List} from '../../models/list';
import {ManageSharingComponent} from '../../modals/manage-sharing/manage-sharing.component';
import {AuthenticationService} from '../../services/authentification.service';
import {last, map, takeLast} from 'rxjs/operators';
import {MetaList} from '../../models/metaList';
import {PhotoService} from '../../services/photo.service';
import {OcrProviderService} from '../../services/ocr-provider.service';
import { Plugins } from '@capacitor/core';
import {CropImgComponent} from '../../modals/crop-img/crop-img.component';
import {Router} from '@angular/router';
import {ShareHistoryComponent} from '../../popOvers/share-history/share-history.component';

const { Network } = Plugins;

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
  private lastList: List[];
  listToRm: List[];
  nbNotif: number;
  private metalist: MetaList[];

  constructor(private listService: ListService,
              private modalController: ModalController,
              private alertController: AlertController,
              private popUpService: PopupService,
              public auth: AuthenticationService,
              private photoService: PhotoService,
              private ocrService: OcrProviderService,
              private popOverController: PopoverController,
              private router: Router
  ){
    this.nbNotif = 0;
    this.listToRm = [];

    this.lists = this.listService.getAllListDB().pipe(
        map(list => {
          console.log('ischecked 0');
          list.forEach(l => l.isChecked = false);
          return list;
        })
    );
    this.lists.subscribe((l) => l.forEach((ll) => console.log(ll.owner)));
    this.listsShared = this.listService.getAllSharedListDB();
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
      this.lastList = listArray;
    });
  }

  ngOnInit(): void {
    this.listsShared = this.listService.getAllSharedListDB();
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

  async takePicture() {
    const status = await Network.getStatus();
    const picture = await  this.photoService.takePicture();

    const modal = await this.modalController.create({
      component: CropImgComponent,
      cssClass: ['crop-modal'],
      componentProps: {
        imageToCrop: picture?.dataUrl
      }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    await this.ocrService.offLineOcrTesseract(data);
    // this.ocrService.OnLineOcrGoogleVisio(data.substring(23));
  }

  routeToTodos(id: string){
    if (!this.editing) { this.router.navigate(['/list-details/' + id]); }
  }

  startEdit() {
      this.editing = true;
  }

  stopEdit() {
    this.editing = false;
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

}
