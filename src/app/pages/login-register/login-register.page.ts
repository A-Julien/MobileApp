import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentification.service';
import {Router} from '@angular/router';
import firebase from 'firebase';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.page.html',
  styleUrls: ['./login-register.page.scss'],
})
export class LoginRegisterPage implements OnInit {

  constructor(private authService: AuthenticationService,
              private router: Router) { }

  ngOnInit() {
    if (firebase.auth().currentUser != null) {
      console.log('connected');
      this.router.navigateByUrl('/home');
    }
  }

  signInGoogle() {
    this.authService.signInWithGoogle();
  }

  signInFacebook() {
    this.authService.signInWithFacebook();
  }
}
