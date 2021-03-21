import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentification.service';
import {PopupService} from '../../services/popup.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthenticationService,
              private popupService: PopupService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(2)]],
      passwordConf: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  async signUp() {
    const loader = await this.popupService.presentLoading('Creating account..');

    if (this.loginForm.get('password').value !== this.loginForm.get('passwordConf').value){
      await loader.dismiss();
      await this.popupService.presentAlert('Password not identical', 'Password error !');
      return;
    }
    this.authService.SignUp(this.loginForm.get('login').value, this.loginForm.get('password').value).catch((err) => {
      this.popupService.presentAlert(err, 'Signup Failed');
      loader.dismiss();
    });
    await loader.dismiss();
  }
}
