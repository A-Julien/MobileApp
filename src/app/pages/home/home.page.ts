import {AfterViewInit, Component, ElementRef, NgZone, OnInit, QueryList, ViewChild, Renderer2} from '@angular/core';
import {
  AlertController,
  ModalController,
  IonItemSliding,
  PopoverController,
  IonSearchbar, GestureController
} from '@ionic/angular';
import { CreateListComponent } from '../../modals/create-list/create-list.component';
import { ListService} from '../../services/list.service';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {PopupService} from '../../services/popup.service';
import {Checker, List} from '../../models/list';
import {ManageSharingComponent} from '../../modals/manage-sharing/manage-sharing.component';
import {AuthenticationService} from '../../services/authentification.service';
import { map, startWith } from 'rxjs/operators';
import {MetaList} from '../../models/metaList';
import {PhotoService} from '../../services/photo.service';
import {Router} from '@angular/router';
import {ShareHistoryComponent} from '../../popOvers/share-history/share-history.component';
import {Updater} from '../../models/updater';
import { ItemReorderEventDetail } from '@ionic/core';
import {OptionsComponent} from '../../popOvers/options/options.component';


import {
  Plugins,
  HapticsImpactStyle
} from '@capacitor/core';
import firebase from 'firebase';

const { Haptics } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public cancelSelect$ = new BehaviorSubject(null);
  @ViewChild(IonSearchbar, { static: true }) searchBar: IonSearchbar;

  /*@ViewChild('slidingItem', {read: ElementRef}) listElems: QueryList<ElementRef>; */
  longPressActive = false;

  lists$: Observable<List[]>;
  listsShared$: Observable<MetaList[]>;
  showLoading = true;

  editing = 0;
  listToRm: List[];
  listToUpdateName: Updater[];
  listSelected: Checker[];
  public exSearch = false;

  nbNotif: number;
  private metalist: MetaList[];

  constructor(private listService: ListService,
              private modalController: ModalController,
              private alertController: AlertController,
              private popUpService: PopupService,
              public auth: AuthenticationService,
              private photoService: PhotoService,
              private popOverController: PopoverController,
              private router: Router,
              private renderer: Renderer2

  ){
    this.nbNotif = 0;
    this.listToRm = [];
    this.listToUpdateName = [];
    this.listSelected = [];
  }



  ngOnInit(): void {

    const searchFilter$ = this.searchBar.ionChange.pipe(
        map(event => (event.target as HTMLInputElement).value),
        startWith('')
    );

    this.lists$ = combineLatest([
        this.listService.lists,
        searchFilter$,
        this.cancelSelect$
    ]).pipe(
        map(([lists, filter]) => {
          this.listSelected = [];
          lists.forEach(l => {
              this.listSelected.push(new Checker(l.id));
            } );
          return lists.filter(
                list =>
                    list.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1
            );
        })
    );

    this.listsShared$ = this.listService.listShare;
    this.listsShared$.subscribe(ml => {
      this.metalist = ml;
      this.nbNotif = 0;
      ml.forEach(meta => {
        if (!meta.notify && meta.newOwner === this.auth.userEmail){
          this.nbNotif += 1;
        }
      });
    });

    this.lists$?.subscribe(() => {
      this.showLoading = false;
    });
  }

  private hapticsImpact(style = HapticsImpactStyle.Heavy) {
    Haptics.impact({
      style
    });
  }

  ItemLongPress(ev, list){
    console.log(list);
    if (this.editing === 2) {
      console.log('wath ?');
      // this.renderer.addClass(ev.target, 'selected');
      this.addToDel(list);
    } else {
      this.routeToTodos(list.id);
    }
  }

  longPress(ev, list) {
    if (this.editing === 1) { return; }
    console.log(ev);
    if (this.editing === 0){
      setTimeout(() => {
        // this.hapticsImpact();
        this.longPressActive = true;
        console.log('LONGPRESSS!');
        // this.renderer.addClass(ev.target, 'selected');
        this.editing = 2;
        list.isChecked = true;
        this.addToDel(list);
      }, 500);
    }
  }

  doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group
    ev.detail.complete();
  }

  async addListModal() {
    const modal = await this.modalController.create({
      component: CreateListComponent,
      cssClass: ['add-modal']
    });
    return await modal.present();
  }

  isNewList(listId: string) {
    let res = false;
    this.metalist?.forEach( ml => {
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
   return this.listsShared$.pipe(
        map(data => {
          return data.find( d => d.listID === list.id && d.owner !== this.auth.userEmail);
        })
    );
  }

  routeToTodos(id: string){
    if (!this.editing) { this.router.navigate(['/list-details/' + id]); }
  }

  // startEdit() { this.editing = true; }

  async stopEdit() {
    this.editing = 0;
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
    this.listSelected.find(l => l.id === list.id).isChecked = true;
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
    this.listToRm = [];
    if (this.longPressActive) {
      this.cancelEdit();
    }
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

  expendSearch() {
    this.exSearch = true;
  }

  unExpendSearch() {
    this.exSearch = false;
  }

  async openOption(ev) {
    console.log(this.listSelected);
    const popover = await this.popOverController.create({
      component: OptionsComponent,
      cssClass: 'popoverOption',
      id: 'options',
      event: ev,
      translucent: false,
      mode: 'ios'
    });
    await popover.present();
    const { data } = await popover.onWillDismiss();
    switch (data){
      case 1:
          this.editing = 1;
          break;
      case 2:
        this.editing = 2;
        break;
    }
  }
  cancelSelect() {
    this.listSelected.forEach(l => l.isChecked = false);
    setTimeout(() => {
      this.listToRm = [];
    }, 100);
  }

  cancelEdit() {
    switch (this.editing){
      case 1:
        this.listToUpdateName = [];
        break;
      case 2:
        this.listSelected.forEach(l => l.isChecked = false);
        this.listToRm = [];
    }
    this.longPressActive = false;
    this.editing = 0;
  }

  iAmCheck(id: string): boolean{
    const i = this.listSelected.findIndex(check => check.id === id);
    if (i === -1 ) { return false; }
    return this.listSelected[i].isChecked;
  }

  addToDelAll() {

  }
}

