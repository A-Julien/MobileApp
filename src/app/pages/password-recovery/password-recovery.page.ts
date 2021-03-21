import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentification.service';
import {Router} from '@angular/router';
import {PopupService} from '../../services/popup.service';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.page.html',
  styleUrls: ['./password-recovery.page.scss'],
})
export class PasswordRecoveryPage implements OnInit {

  loginForm: FormGroup;

  constructor(
      private formBuilder: FormBuilder,
      private authService: AuthenticationService,
      private router: Router,
      private popupService: PopupService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required, Validators.email]]
    });
  }

  async passwordRecovery() {
    const loader = await this.popupService.presentLoading('Sending email..');

    await this.authService.PasswordRecovery(this.loginForm.get('login').value)
        .catch((err) => {
          loader.dismiss();
          this.popupService.presentAlert(err, 'An error append');
        });
    await loader.dismiss();
  }
}
