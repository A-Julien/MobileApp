import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase';
import {redirectLoggedInTo} from '@angular/fire/auth-guard';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  userData: Observable<firebase.User>;
  user = null;

  constructor(private angularFireAuth: AngularFireAuth, private router: Router) {
    this.userData = angularFireAuth.authState;
  }

  /* Sign up */
  SignUp(email: string, password: string) {
    this.angularFireAuth
        .createUserWithEmailAndPassword(email, password)
        .then(res => {
          console.log('Successfully signed up!', res);
        })
        .catch(error => {
          console.log('Something is wrong:', error.message);
        });
  }

  /* Sign in */
  SignIn(email: string, password: string) {
    this.angularFireAuth
        .signInWithEmailAndPassword(email, password)
        .then(res => {
          console.log('Successfully signed in!');
          this.user = res;
          this.router.navigate(['/home']);
        })
        .catch(err => {
          console.log('Something is wrong:', err.message);
        });
  }

  /* Sign out */
  SignOut() {
    this.angularFireAuth
        .signOut();
  }

  isLoggedIn(): boolean {
    console.log(this.user);
    return this.user != null;
  }

}
