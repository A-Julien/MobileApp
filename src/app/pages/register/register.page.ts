import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentification.service';
import {ToastController} from "@ionic/angular";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthenticationService,
              private toastController: ToastController) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(2)]],
      passwordConf: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  signUp() {
    if (this.loginForm.get('password').value !== this.loginForm.get('passwordConf').value){
      this.authService.presentToast('password not identical');
      return;
    }
    this.authService.SignUp(this.loginForm.get('login').value, this.loginForm.get('password').value);
  }
}
