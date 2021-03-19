import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentification.service';
import {Router} from '@angular/router';
import firebase from 'firebase';
import {PopupService} from '../../services/popup.service';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.page.html',
  styleUrls: ['./login-register.page.scss'],
})
export class LoginRegisterPage implements OnInit {

  constructor(private authService: AuthenticationService,
              private router: Router,
              private popoverService: PopupService) { }

  ngOnInit() {
    if (firebase.auth().currentUser != null) {
      console.log('connected');
      this.router.navigateByUrl('/home');
    }
  }

  async signInGoogle() {
    const loader = await this.popoverService.presentLoading('Login in..');
    await this.authService.signInWithGoogle().catch(() => {loader.dismiss(); });
    await loader.dismiss();
  }

  async signInFacebook() {
    const loader = await this.popoverService.presentLoading('Login in..');
    await this.authService.signInWithFacebook().catch(() => {loader.dismiss(); });
    await loader.dismiss();
  }
}
