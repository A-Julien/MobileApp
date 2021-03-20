import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { ListService} from '../../services/list.service';
import {IonSearchbar, ModalController, PopoverController} from '@ionic/angular';
import {CreateTodoComponent} from '../../modals/create-todo/create-todo.component';
import {combineLatest, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {List} from '../../models/list';
import {Todo} from '../../models/todo';
import {AuthenticationService} from '../../services/authentification.service';
import {PopupService} from '../../services/popup.service';
import {Updater} from '../../models/updater';
import {OptionsComponent} from '../../popOvers/options/options.component';

import {
  Plugins,
  HapticsImpactStyle
} from '@capacitor/core';

const { Haptics } = Plugins;

@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.page.html',
  styleUrls: ['./list-details.page.scss'],
})
export class ListDetailsPage implements OnInit {

  @ViewChild(IonSearchbar, { static: true }) searchBar: IonSearchbar;

  listID: string;
  listName: string;
  showLoader = true;

  editing = 0;
  todosToRm: Todo[];
  todosToUpdate: Updater[];

  longPressActive = false;
  public exSearch = false;

  nbNotif: number;

  public list$: Observable<List>;
  public todos$: Observable<Todo[]>;

  constructor(
      private route: ActivatedRoute,
      private listService: ListService,
      public modalController: ModalController,
      private auth: AuthenticationService,
      private popUpService: PopupService,
      private router: Router,
      private popOverController: PopoverController)
  { }

  ngOnInit() {
    this.todosToRm = [];
    this.todosToUpdate = [];
    this.listID = this.route.snapshot.paramMap.get('listId');
    this.list$ = this.listService.getOneDB(this.listID);
    const todoFromList = this.list$.pipe(
        map(list => {
          return list.todos;
        })
    );

    const searchFilter$ = this.searchBar.ionChange.pipe(
        map(event => (event.target as HTMLInputElement).value),
        startWith('')
    );

    this.todos$ = combineLatest([
      todoFromList,
      searchFilter$
    ]).pipe(
        map(([todo, filter]) =>
            todo.filter(
                list =>
                    list.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1
            )
        )
    );


    this.todos$.subscribe(() => this.showLoader = false);

    this.listService.listShare.subscribe( data => {
      data.forEach(d => {
        if (d.listID === this.listID && d.newOwner === this.auth.userEmail && !d.notify){
          this.listService.removedNotyficationShared(d);
          return;
        }
      });
    });

    this.listService.listShare.subscribe( data => {
      data.forEach(d => {
        if (!d.notify && d.newOwner === this.auth.userEmail){this.nbNotif += 1; }
      });
    });
  }

  async addTodoModal() {
    const modal = await this.modalController.create({
      component: CreateTodoComponent,
      cssClass:  ['add-modal-todo'],
      componentProps: {
        // @ts-ignore
        listId : this.listID
      }
    });
    return await modal.present();
  }

  async stopEdit() {
    this.editing = 0;
    const nbTodos =  this.todosToUpdate.length;

    let msg = 'Update Name of ' + nbTodos + ' todo';
    if ( nbTodos > 1) { msg = 'Update Name of ' + nbTodos + ' Todos'; }
    const loader = await this.popUpService.presentLoading(msg);

    this.todosToUpdate.forEach(u => {
      console.log('update todo ', u.field);
      this.updateTodoName(u);
    });
    this.todosToUpdate = [];

    await loader.dismiss();

  }

  async updateTodoName(u: Updater){
    await this.listService.updateTodoName(u, this.listID);
  }

  addToDel(todo: Todo){
    if (this.todosToRm.indexOf(todo) !== -1){
      this.todosToRm = this.todosToRm.filter(t => t !== todo);
      return;
    }
    this.todosToRm.push(todo);
  }

  delete(u: Updater, listId) {
      this.listService.deleteTodo(u, listId);
  }

  private hapticsImpact(style = HapticsImpactStyle.Heavy) {
    Haptics.impact({
      style: style
    });
  }


  ItemLongPress(ev, todo: Todo){
    console.log(todo);
    if (this.editing === 2) {
      console.log('wath ?');
      // this.renderer.addClass(ev.target, 'selected');
      this.addToDel(todo);
    } else {
      this.routeToDetail(todo.id);
    }
  }

  longPress(ev, todo: Todo) {
    if (this.editing === 1) { return; }
    console.log(ev);
    if (this.editing === 0){
      setTimeout(() => {
        this.hapticsImpact();
        this.longPressActive = true;
        console.log('LONGPRESSS!');
        // this.renderer.addClass(ev.target, 'selected');
        this.editing = 2;
        todo.isChecked = true;
        this.addToDel(todo);
      }, 500);
    }
  }

  async delSelect() {
    const nbTodos = this.todosToRm.length;
    let msg = 'deleting ' + nbTodos + ' todo';
    if ( nbTodos > 1) { msg = 'Deleting ' + nbTodos + ' Todos'; }
    const loader = await this.popUpService.presentLoading(msg);

    this.todosToRm.forEach(todo => {
      this.delete(new Updater(todo.id, todo.name), this.listID);
    });
    this.todosToRm = [];
    await loader.dismiss();
  }

  routeToDetail(TodoId: string) {
    if (!this.editing) { this.router.navigate(['/list-details/' + this.listID + '/todo-details/' + TodoId]); }
  }

  addToUpdateTodoName(todo: Todo): void {
    console.log(this.todosToUpdate.length);
    const index = this.todosToUpdate.findIndex(t => t.id === todo.id);
    if (index !== -1){
      this.todosToUpdate[index].field = todo.name;
      return;
    }
    this.todosToUpdate.push(new Updater(todo.id, todo.name));
  }

  expendSearch() {
    this.exSearch = true;
  }

  unExpendSearch() {
    this.exSearch = false;
  }

  async openOption(ev) {
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
    console.log('choice ', data);
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
    this.todosToRm.forEach(t => t.isChecked = false);
    this.todosToRm = [];
  }

  cancelEdit() {
    switch (this.editing){
      case 1:
        this.todosToUpdate = [];
        break;
      case 2:
        this.todosToRm.forEach(t => t.isChecked = false);
        this.todosToRm = [];
    }
    this.longPressActive = false;
    this.editing = 0;
  }

  addToDelAll() {

  }
}
