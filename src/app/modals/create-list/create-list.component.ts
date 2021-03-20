import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { List, ListType } from '../../models/list';
import { ListService } from '../../services/list.service';
import { ModalController } from '@ionic/angular';
import {UserInfoService} from '../../services/user-info.service';

@Component({
  selector: 'app-create-list',
  templateUrl: './create-list.component.html',
  styleUrls: ['./create-list.component.scss'],
})
export class CreateListComponent implements OnInit {

  newListForm: FormGroup;
  type: ListType.todo;
  activeCategory: string;

  constructor(private modalController: ModalController,
              private formBuilder: FormBuilder,
              private listService: ListService,
              private uInfoService: UserInfoService) {
    this.activeCategory = 'All';
  }

  ngOnInit(){
    this.uInfoService.activeCategory$.subscribe( cat => this.activeCategory = cat);

    this.newListForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['0', [Validators.required]]
    });
  }

  async dismissModal() {
    console.log(this.newListForm.get('type').value);
    await this.modalController.dismiss();
  }

  createNewList(){
    if (this.newListForm.valid){
      this.listService.createList(
          new List(
              this.newListForm.get('name').value,
              this.newListForm.get('type').value,
              this.activeCategory
              ));
      this.dismissModal();
    }
  }

  get errorControl() {
    return this.newListForm.controls;
  }

}
