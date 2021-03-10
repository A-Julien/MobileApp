import {Component, OnInit, ViewChild} from '@angular/core';
import {AlertController, ModalController, IonItemSliding, ActionSheetController} from '@ionic/angular';
import { CreateListComponent } from '../../modals/create-list/create-list.component';
import { ListService} from '../../services/list.service';
import {Observable} from 'rxjs';
import {PopupService} from '../../services/popup.service';
import {List} from '../../models/list';
import {ManageSharingComponent} from '../../modals/manage-sharing/manage-sharing.component';
import {AuthenticationService} from '../../services/authentification.service';
import {map} from 'rxjs/operators';
import {MetaList} from '../../models/metaList';
import {PhotoService} from '../../services/photo.service';
import {OcrProviderService} from '../../services/ocr-provider.service';
import { Plugins } from '@capacitor/core';
import {CropImgComponent} from '../../modals/crop-img/crop-img.component';
import {Router} from '@angular/router';

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

  constructor(private listService: ListService,
              private modalController: ModalController,
              private alertController: AlertController,
              private popupService: PopupService,
              public auth: AuthenticationService,
              private photoService: PhotoService,
              private ocrService: OcrProviderService,
              private router: Router
  ){

    this.lists = this.listService.getAllListDB();
    this.lists.subscribe((l) => l.forEach((ll) => console.log(ll.owner)));
    this.listsShared = this.listService.getAllSharedListDB();
    this.lists.subscribe(() => this.showLoading = false);
  }

  ngOnInit(): void {
    this.listsShared = this.listService.getAllSharedListDB();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CreateListComponent
    });
    return await modal.present();
  }

  delete(list: List): void {
    this.listService.deleteList(list);
  }

  public async share(list: List, slidingItem: IonItemSliding) {
    if (list.owner !== this.auth.getUserId()) {
      this.popupService.presentToast('can not share a list that don\'t belong to you');
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
          return data.find( d => d.listID === list.id && d.owner !== this.auth.getUserEmail());
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

  startedit() {
      this.editing = true;
  }

  stopedit() {
    this.editing = false;
  }

  delSelect() {
    console.log('wsh');

    this.listService.getAllListDB().toPromise().then( (listArray) => {
      console.log(listArray);
      listArray.forEach((list) => {
        if (list.isChecked) { this.delete(list); }
      });
    });


  }
}
