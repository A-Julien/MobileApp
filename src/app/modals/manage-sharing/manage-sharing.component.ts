import { Component, OnInit } from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {List} from '../../models/list';
import {ListService} from '../../services/list.service';
import {PopupService} from '../../services/popup.service';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {AuthenticationService} from '../../services/authentification.service';

@Component({
  selector: 'app-manage-sharing',
  templateUrl: './manage-sharing.component.html',
  styleUrls: ['./manage-sharing.component.scss'],
})
export class ManageSharingComponent implements OnInit {
  newShareForm: FormGroup;
  private list: List = this.navParams.get('listParam');
  sharedUsers$: Observable<string[]>;

  constructor(
      private modalController: ModalController,
      private formBuilder: FormBuilder,
      private navParams: NavParams,
      private listService: ListService,
      private popupService: PopupService,
      public auth: AuthenticationService
  ) {}

  ngOnInit() {
    this.newShareForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.listService.getOneList(this.list.id).pipe(
        map(list => {
          console.log('WEH');
          console.log(list.owners);
        })
    );
    this.sharedUsers$ = this.listService.getOneList(this.list.id).pipe(
        map( (list) => list.owners.filter(
            user => user !== this.auth.userEmail
        ))
    );

  }

  async dismissModal() {
    await this.modalController.dismiss();
  }

  get errorControl() {
    return this.newShareForm.controls;
  }

  public unShare(userEmail: string){
    this.listService.removeSharedUser(userEmail, this.list);
  }

  public share() {
    const email = this.newShareForm.get('email').value;
    this.newShareForm.get('email').reset();
    this.listService.shareList(this.list, email)
        .then(() => this.popupService.presentToast(this.list.name + ' shared with ' + email + '!'))
        .catch(() => this.popupService.presentToast('Error, ' + this.list.name + ' not shared'));
  }

  emailAlreadyShare() {
    /*this.sharedUsers$.pipe(
        map( sU => sU.indexOf(this.newShareForm..get('email').value))
    );*/
  }
}
