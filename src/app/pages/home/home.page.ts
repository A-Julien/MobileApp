import {Component, OnInit} from '@angular/core';
import {AlertController, ModalController, IonItemSliding} from '@ionic/angular';
import { CreateListComponent } from '../../modals/create-list/create-list.component';
import { ListService} from '../../services/list.service';
import {Observable} from 'rxjs';
import {PopupService} from '../../services/popup.service';
import {List} from '../../models/list';
import {ManageSharingComponent} from '../../modals/manage-sharing/manage-sharing.component';
import {AuthenticationService} from '../../services/authentification.service';
import {map, switchMap} from 'rxjs/operators';
import {MetaList} from '../../models/metaList';
import {PhotoService} from "../../services/photo.service";
import {OcrProviderService} from "../../services/ocr-provider.service";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  lists: Observable<List[]>;
  listsShared: Observable<MetaList[]>;
  showLoading = true;
  private imageElement: any;

  constructor(private listService: ListService,
              private modalController: ModalController,
              private alertController: AlertController,
              private popupService: PopupService,
              public auth: AuthenticationService,
              private photoService: PhotoService,
              private ocrService: OcrProviderService){

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

  takePicture() {
    this.photoService.takePicture().then( picture => {
      console.log(picture.base64String);
      this.ocrService.getLabels(picture.base64String);
    });
  }
}
