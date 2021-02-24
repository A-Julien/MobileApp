import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase';
import {Router} from '@angular/router';
import {AlertController} from '@ionic/angular';
import {Plugins} from '@capacitor/core';
import '@codetrix-studio/capacitor-google-auth';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  userData: Observable<firebase.User>;
  user = null;

  constructor(private angularFireAuth: AngularFireAuth,
              private router: Router,
              public alertController: AlertController) {
    this.userData = angularFireAuth.authState;
  }

  /* Sign up */
  SignUp(email: string, password: string) {
    this.angularFireAuth
        .createUserWithEmailAndPassword(email, password)
        .then(res => {
          console.log('Successfully signed up!', res);
          this.presentAlert( 'Successfully signed up!' );
          res.user.sendEmailVerification();
          this.router.navigate(['/login']);
        })
        .catch(error => {
            this.presentAlert( 'Something is wrong:' + error.message);
            console.log('Something is wrong:', error.message);
        });
  }

  /* Sign in */
  SignIn(email: string, password: string) {
    this.angularFireAuth
        .signInWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user.emailVerified) {
              console.log('Successfully signed in!');
              this.presentAlert( 'Successfully signed in!' );
              this.user = res;
              this.router.navigate(['/home']);
          } else {
                this.presentAlert( 'Failed to sign in, email is not verified');
                console.log('Email not verified');
          }
        })
        .catch(err => {
            this.presentAlert( 'Failed to sign in, email or password does not exist');
            console.log('Something is wrong:', err.message);
        });
  }

  /* Sign out */
  SignOut() {
    this.angularFireAuth
        .signOut();
  }

  PasswordRecovery(email: string) {
      this.angularFireAuth
          .sendPasswordResetEmail(email)
          .then(res => {
              console.log('Email sent');
              this.presentAlert( 'Email sent to ' + email);
              this.router.navigate(['/login']);
          })
          .catch(err => {
              this.presentAlert( 'Email not found' + err.message);
              console.log('Something is wrong:', err.message);
          });
  }

  isLoggedIn(): boolean {
    console.log(this.user);
    return this.user != null;
  }

    private async presentAlert(msg: string) {
        const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Alert',
            // subHeader: 'Subtitle',
            message: msg,
            // buttons: ['OK']
        });

        await alert.present();
    }

    async signInWithGoogle() {
        const googleUser = await Plugins.GoogleAuth.signIn() as any;
        const credential = firebase.auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
        this.angularFireAuth.signInAndRetrieveDataWithCredential(credential)
            .then(res => {
                this.user = res;
                this.presentAlert( 'Successfully signed in!' );
                this.router.navigate(['/home']);
            })
            .catch(err => {
                this.presentAlert( 'Failed to sign in via Google');
                console.log('Something is wrong:', err.message);
            });


    }

}
