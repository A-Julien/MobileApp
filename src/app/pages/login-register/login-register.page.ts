import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentification.service';
import {ToastController} from '@ionic/angular';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.page.html',
  styleUrls: ['./login-register.page.scss'],
})
export class LoginRegisterPage implements OnInit {

  constructor(private authService: AuthenticationService,
              private router: Router) { }

  ngOnInit() {
  }

  signInGoogle() {
    this.authService.signInWithGoogle();
  }

  signInFacebook() {
    this.authService.signInWithFacebook();
  }
}
