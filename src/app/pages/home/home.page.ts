import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {
  AlertController,
  ModalController,
  IonItemSliding,
  PopoverController,
  IonSearchbar,
  IonSelect, IonCheckbox
} from '@ionic/angular';
import { CreateListComponent } from '../../modals/create-list/create-list.component';
import { ListService} from '../../services/list.service';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {PopupService} from '../../services/popup.service';
import {Checker, List, ListType} from '../../models/list';
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
import {UserInfoService} from '../../services/user-info.service';
import {UserInfo} from '../../models/userinfo';
import {Category} from '../../models/category';
import set = Reflect.set;
import {VersioningService} from "../../services/versioning.service";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild('catSelect') catSelectRef: IonSelect;

  public cancelSelect$ = new BehaviorSubject(null);
  @ViewChild(IonSearchbar, { static: true }) searchBar: IonSearchbar;

  @ViewChild('selectAll', { static: true }) selectAll: IonCheckbox;

  longPressActive = false;

  categories: string[];

  lists$: Observable<List[]>;
  listsShared$: Observable<MetaList[]>;
  showLoading = true;

  editing = 0;
  listToAction: List[];
  listToUpdateName: Updater[];
  listSelected: Checker[];
  public exSearch = false;

  nbNotif: number;
  private metalist: MetaList[];
  userInfo$: Observable<UserInfo>;
  userCat$: Observable<Category[]>;

  private listToDelAll: List[];
  private noTrigger = false;

  iAmCheck$ = new BehaviorSubject<Checker[]>(null);

  constructor(private listService: ListService,
              private modalController: ModalController,
              private alertController: AlertController,
              private popUpService: PopupService,
              public auth: AuthenticationService,
              private photoService: PhotoService,
              private popOverController: PopoverController,
              private router: Router,
              public uInfoService: UserInfoService,
              public version: VersioningService

  ){
    this.nbNotif = 0;
    this.listToAction = [];
    this.listToUpdateName = [];
    this.listSelected = [];
  }

  ngOnInit(): void {
    this.userCat$ = this.uInfoService.userCat$.pipe(
        map(categories => {
          categories.unshift(new Category('None'));
          return categories;
        })
    );

    this.userInfo$ = this.uInfoService.userInfoOb$.pipe(
      map(usrInf => {
        usrInf.categories = usrInf.categories.filter( cat => cat !== 'None');
        usrInf.categories.unshift('None');
        return usrInf;
      })
    );


    this.uInfoService.userInfoOb$.subscribe( uInfo =>
      this.categories = uInfo?.categories
    );


    const searchFilter$ = this.searchBar.ionChange.pipe(
        map(event => (event.target as HTMLInputElement).value),
        startWith('')
    );

    this.lists$ = combineLatest([
        this.listService.lists,
        searchFilter$,
        this.cancelSelect$,
        this.uInfoService.activeCategory$
    ]).pipe (
        map(([lists, filter, cancel, activeCategory]) => {
          this.iAmCheck$.next(this.listSelected);
          lists = lists.filter(
                list =>
                  list.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1
            );
          if (activeCategory.name === 'None') { return lists; }
          return lists.filter( list => activeCategory.lists.indexOf(list.id) !== -1 );
        }),
        map(listList => {
          listList.sort((a, b) => {
            return a.name < b.name ? -1 : 1;
          });
          return listList;
        })
    );

    this.lists$.subscribe((larr) => {
      this.listSelected = [];
      larr.forEach(l => {
        this.listSelected.push(new Checker(l.id));
      });

      this.listToDelAll = larr;
    });

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

  ItemLongPress(ev, list: List){
    if (this.editing === 2 || this.editing === 3) {
      this.addToDel(list);
      return;
    }
    console.log(list);
    switch (list.type) {
      case ListType.note:
        this.routeToList(list.id);
        break;
      case ListType.todo:
        this.routeToTodos(list.id);
        break;
      default:
        console.log('lol');
        break;
    }
  }

  longPress(ev, list) {
    if (this.editing === 1) { return; }
    console.log(ev);
    if (this.editing === 0){
      setTimeout(() => {
        this.popUpService.hapticsImpact();
        this.longPressActive = true;
        this.editing = 2;
        list.isChecked = true;
        this.addToDel(list);
      }, 400);
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

  private routeToList(id: string){
    if (!this.editing) { this.router.navigate(['/list-details/' + id]); }
  }

  private routeToTodos(id: string){
    if (!this.editing) { this.router.navigate(['/list-details-todo/' + id]); }
  }

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

  addToDel(list: List, overideSelectAll = false){
    if (this.selectAll.checked && !overideSelectAll) {
      this.noTrigger = true;
      this.selectAll.checked = false;
    }

    if (this.listToAction.findIndex((l) => l.id === list.id) !== -1){
      console.log(list);
      this.listToAction = this.listToAction.filter(l => l.id !== list.id);
      return;
    }
    this.listSelected.find(l => l.id === list.id).isChecked = true;
    this.iAmCheck$.next(this.listSelected);
    this.listToAction.push(list);
  }

  addToDelAll(ev) {
    if (this.noTrigger){
      this.noTrigger = false;
      console.log('fuck');
      return;
    }
    console.log('weh gros', this.selectAll.checked);
    console.log('weh gros', ev.target.value);
    if (this.selectAll.checked){
      console.log('in true');

      this.listToAction = [];
      this.listToDelAll.forEach(l => { this.addToDel(l, true); });
      // this.zone.run( () => {
      this.listSelected.forEach(l => l.isChecked = true);
      // });
      return;
    }

    if (!this.selectAll.checked){
      this.cancelSelect();
    }
  }

  async delSelect() {
    let msg = 'deleting ' + this.listToAction.length + ' list';
    if ( this.listToAction.length > 1) { msg = 'deleting ' + this.listToAction.length + ' lists'; }
    const loader = await this.popUpService.presentLoading(msg);
    this.editing = 0;
    this.listToAction.forEach(list => {
        console.log('delete list ', list.name);
        this.delete(list);
    });
    this.listToAction = [];
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
        this.editing = 3;
        break;
    }
  }
  cancelSelect() {
    if (this.selectAll.checked) {
      this.noTrigger = true;
      this.selectAll.checked = false;
    }
    this.listSelected.forEach(l => l.isChecked = false);
    this.listToAction = [];
  }

  cancelEdit() {
    switch (this.editing){
      case 1:
        this.listToUpdateName = [];
        break;
      case 2:
      case 3:
        this.listSelected.forEach(l => l.isChecked = false);
        this.listToAction = [];
        break;
    }
    this.longPressActive = false;
    this.editing = 0;
  }

  iAmCheck(id: string): boolean{
    const i = this.listSelected.findIndex(check => check.id === id);
    if (i === -1 ) { return false; }
    return this.listSelected[i].isChecked;
  }



  async choiceCategory(){
    await this.catSelectRef.open();
  }

  async  addToCategory(CatName = '') {
    let newcat = this.catSelectRef.value;
    if (CatName === 'None'){ newcat = new Category('None'); }

    const loader = await this.popUpService.presentLoading('Add ' + this.listToAction.length + ' lists to ' + newcat.name);
    this.editing = 0;
    for (const list of this.listToAction) {
      await this.uInfoService.addListToCategory(list.id, newcat).catch((err) => {
        loader.dismiss();
        this.cancelEdit();
        console.log(err);
        this.popUpService.presentAlert('An error was occurred', 'Error');
      });
    }
    this.cancelEdit();
    await loader.dismiss();
  }
}

