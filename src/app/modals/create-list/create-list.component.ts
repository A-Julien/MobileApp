import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { List, ListType } from '../../models/list';
import { ListService } from '../../services/list.service';
import { ModalController } from '@ionic/angular';
import {UserInfoService} from '../../services/user-info.service';
import {Router} from '@angular/router';
import {PopupService} from '../../services/popup.service';
import {Category} from '../../models/category';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-create-list',
  templateUrl: './create-list.component.html',
  styleUrls: ['./create-list.component.scss'],
})
export class CreateListComponent implements OnInit, OnDestroy {

  newListForm: FormGroup;
  type: ListType.todo;
  activeCategory: Category;
  private catSub: Subscription;

  constructor(private modalController: ModalController,
              private formBuilder: FormBuilder,
              private listService: ListService,
              private uInfoService: UserInfoService,
              private router: Router,
              private popupService: PopupService) {
  }

  ngOnInit(){
    this.catSub = this.uInfoService.activeCategory$.subscribe( cat => this.activeCategory = cat);

    this.newListForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['0', [Validators.required]]
    });
  }

  async dismissModal() {
    console.log(this.newListForm.get('type').value);
    await this.modalController.dismiss();
  }

  async createNewList(){
    const loader = await this.popupService.presentLoading('Adding ' + this.newListForm.get('name').value);
    if (this.newListForm.valid){
      const l = await this.listService.createList(
          new List(
              this.newListForm.get('name').value,
              this.newListForm.get('type').value
              )).catch( async () => {
          await loader.dismiss();
          await this.popupService.presentAlert('error when created ' + this.newListForm.get('name').value);
      });
      if (l) { await this.popupService.presentToast(this.newListForm.get('name').value + ' created', 1000); }
      else {
        await loader.dismiss();
        await this.popupService.presentAlert('error when created ' + this.newListForm.get('name').value);
        return;
      }

      await this.uInfoService.addListToCategory(l.id, this.activeCategory);

      switch (this.newListForm.get('type').value){
        case '0':
          this.routeToList(l.id);
          break;
        case '1':
          this.routeToTodos(l.id);
          break;
      }
      await loader.dismiss();
      await this.dismissModal();
    }
  }


  private routeToList(id: string){
     this.router.navigate(['/list-details/' + id]);
  }

  private routeToTodos(id: string){
     this.router.navigate(['/list-details-todo/' + id]);
  }

  get errorControl() {
    return this.newListForm.controls;
  }

  ngOnDestroy() {
    console.log('destroy');
    this.catSub.unsubscribe();
  }
}
