import {Component, ContentChild} from '@angular/core';
import {IonInput} from '@ionic/angular';

@Component({
  selector: 'app-show-hide-password',
  templateUrl: './show-hide-password.page.html',
  styleUrls: ['./show-hide-password.page.scss'],
})
export class ShowHidePasswordPage {

  showPassword = false;
  @ContentChild(IonInput) input: IonInput;

  constructor() {}

  toggleShow() {
    this.showPassword = !this.showPassword;
    this.input.type = this.showPassword ? 'text' : 'password';
  }
}
