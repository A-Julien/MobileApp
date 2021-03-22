import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { ListService} from '../../services/list.service';
import {AlertController, IonCheckbox, IonSearchbar, ModalController, PopoverController} from '@ionic/angular';
import {CreateTodoComponent} from '../../modals/create-todo/create-todo.component';
import {combineLatest, Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {Checker, List} from '../../models/list';
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

  @ViewChild('selectAll', { static: true }) selectAll: IonCheckbox;

  @ViewChild(IonSearchbar, { static: true }) searchBar: IonSearchbar;

  listID: string;
  listName: string;
  showLoader = true;

  editing = 0;
  todosSelected: Checker[];
  todosToRm: Todo[];
  todosToUpdate: Updater[];

  longPressActive = false;
  public exSearch = false;

  nbNotif: number;

  public list$: Observable<List>;
  public todos$: Observable<Todo[]>;
  private todoToDelAll: Todo[];
  private noTrigger = false;

  constructor(
      private route: ActivatedRoute,
      private listService: ListService,
      public modalController: ModalController,
      private auth: AuthenticationService,
      private popUpService: PopupService,
      private router: Router,
      private popOverController: PopoverController,
      private alertCtrl: AlertController)
  {
    this.todosSelected = [];
    this.todosToRm = [];
    this.todosToUpdate = [];
  }

  ngOnInit() {
    this.listID = this.route.snapshot.paramMap.get('listId');
    this.list$ = this.listService.getOneDB(this.listID);
    const todoFromList$ = this.list$.pipe(
        map(list => {
          return list ? list.todos : [];
        })
    );

    const searchFilter$ = this.searchBar.ionChange.pipe(
        map(event => (event.target as HTMLInputElement).value),
        startWith('')
    );

    this.todos$ = combineLatest([
      todoFromList$,
      searchFilter$
    ]).pipe(
        map(([todo, filter]) => {
          return todo?.filter(
              list =>
                  list.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1
          );
        }),
        map(todoList => {
          todoList.sort((a, b) => {
            return a.name < b.name ? -1 : 1;
          });
          return todoList;
        })
    );

    this.todos$.subscribe((to) => {
      this.showLoader = false;
      this.todosSelected = [];
      to.forEach(l => {
        this.todosSelected.push(new Checker(l.id));
      });
      this.todoToDelAll = to;
    });

    this.listService.listShare$.subscribe(data => {
      data.forEach(d => {
        if (d.listID === this.listID && d.newOwner === this.auth.userEmail && !d.notify){
          this.listService.removedNotyficationShared(d);
          return;
        }
      });
    });

    this.listService.listShare$.subscribe(data => {
      data.forEach(d => {
        if (!d.notify && d.newOwner === this.auth.userEmail){this.nbNotif += 1; }
      });
    });
  }

  async addTodoModal() {
    const alert = await this.alertCtrl.create({
      header: 'New note',
      mode: 'ios',
      inputs: [
        {
          label: 'name',
          name: 'todoName',
          placeholder: 'Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Add',
          handler: async data => {
            if (data.todoName) {
              const loader = await this.popUpService.presentLoading('Adding ' + data.todoName);
              const t = await this.listService.creatTodo2(new Todo(data.todoName, '') , this.listID);
              if (t) {
                await this.popUpService.presentToast(data.todoName + ' added', 1000);
                this.routeToDetail(t.id);
                await loader.dismiss();
              } else {
                await loader.dismiss();
                await this.popUpService.presentAlert('An error was occurred can not add ' + data.todoName);
              }
            } else {
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
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

  addToDel(todo: Todo, overideSelectAll = false){
    if (this.selectAll.checked && !overideSelectAll) {
      this.noTrigger = true;
      this.selectAll.checked = false;
    }

    if (this.todosToRm.findIndex(t => t.id === todo.id) !== -1){
      todo.isChecked = false;
      this.todosSelected.find(t => t.id === todo.id).isChecked = false;
      this.todosToRm = this.todosToRm.filter(t => t.id !== todo.id);
      return;
    }
    this.todosSelected.find(l => l.id === todo.id).isChecked = true;
    this.todosToRm.push(todo);
  }

  addToDelAll() {
    if (this.noTrigger) {
      this.noTrigger = false;
      console.log('fuck');
      return;
    }

    if (this.selectAll.checked) {
      console.log('in true');

      this.todosToRm = [];
      this.todoToDelAll.forEach(t => { this.addToDel(t, true); });
      // this.zone.run( () => {
      this.todosSelected.forEach(t => t.isChecked = true);
      // });
      return;
    }
  }

  delete(u: Updater, listId) {
      this.listService.deleteTodo(u, listId);
  }

  ItemLongPress(ev, todo: Todo){
    if (this.editing === 2) {
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
        this.popUpService.hapticsImpact();
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
    this.editing = 0;
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
    if (this.selectAll.checked) {
      this.noTrigger = true;
      this.selectAll.checked = false;
    }

    this.todosSelected.forEach(l => l.isChecked = false);
    this.todosToRm = [];
  }

  cancelEdit() {
    switch (this.editing){
      case 1:
        this.todosToUpdate = [];
        break;
      case 2:
        this.todosSelected.forEach(t => t.isChecked = false);
        this.todosToRm = [];
    }
    this.longPressActive = false;
    this.editing = 0;
  }

  async saveListName(ev) {
   await this.listService.updateListName(new Updater(this.listID, ev.target.value));
  }

  trackByIdx(index: number, obj: any): any {
    return index;
  }
}
