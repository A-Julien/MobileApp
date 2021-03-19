import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentification.service';
import {Router} from '@angular/router';
import {PopupService} from '../../services/popup.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;

  constructor(
      private formBuilder: FormBuilder,
      private auth: AuthenticationService){}
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  signIn() {
    this.auth.SignIn(this.loginForm.get('login').value, this.loginForm.get('password').value)
  }
}
