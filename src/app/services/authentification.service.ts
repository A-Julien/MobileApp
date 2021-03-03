import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase';
import {Router} from '@angular/router';
import {AlertController, ToastController} from '@ionic/angular';
import {Plugins, registerWebPlugin} from '@capacitor/core';
import '@codetrix-studio/capacitor-google-auth';
import {FacebookLogin, FacebookLoginPlugin} from '@capacitor-community/facebook-login';
import {HttpClient} from '@angular/common/http';

registerWebPlugin(FacebookLogin);

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  private userData: Observable<firebase.User>;
  private user = null;
  private token = null;
  private fbLogin: FacebookLoginPlugin;

  constructor(private angularFireAuth: AngularFireAuth,
              private router: Router,
              public alertController: AlertController,
              private http: HttpClient,
              private toastController: ToastController) {
    this.userData = angularFireAuth.authState;
    this.fbLogin = FacebookLogin;
  }

  /* Sign up */
  SignUp(email: string, password: string) {
    this.angularFireAuth
        .createUserWithEmailAndPassword(email, password)
        .then(res => {
          console.log('Successfully signed up!', res);
          this.presentAlert( 'Successfully signed up! Check your mail box' );
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
              this.user = res.user.uid;
              console.log(this.user);
              console.log('Successfully signed in!');
              this.presentToast( 'Successfully signed in!' );
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
            buttons: ['OK']
        });

        await alert.present();
    }

    async presentToast(msg: string) {
        const toast = await this.toastController.create({
            message: msg,
            duration: 2000
        });
        toast.present();
    }

    async signInWithFacebook() {
        const FACEBOOK_PERMISSIONS = ['email', 'user_birthday'];
        const result = await this.fbLogin.login({ permissions: FACEBOOK_PERMISSIONS });

        if (result.accessToken && result.accessToken.userId) {
            this.token = result.accessToken;
            this.loadUserData();
        } else if (result.accessToken && !result.accessToken.userId) {
            this.getCurrentToken();
        } else {
            this.presentAlert('Facebook Login Failed');
        }
    }

    async getCurrentToken() {
        const result = await this.fbLogin.getCurrentAccessToken();
        if (result.accessToken) {
            this.token = result.accessToken;
            this.loadUserData();
        } else {
            // Not logged in.
        }
    }

    async loadUserData() {
        const url = `https://graph.facebook.com/${this.token.userId}?fields=id,name,picture.width(720),birthday,email&access_token=${this.token.token}`;
        this.user = await this.http.get(url);
        if (this.user === null){
            await this.presentAlert('Facebook Login Failed');
            return;
        }
        await this.presentToast('login success');
        this.router.navigate(['/home']);
  }

    async FbLogout() {
        await this.fbLogin.logout();
        this.user = null;
        this.token = null;
    }

    public getUserId() {
        return this.user;
    }

    async signInWithGoogle() {
        const googleUser = await Plugins.GoogleAuth.signIn() as any;
        const credential = firebase.auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
        this.angularFireAuth.signInAndRetrieveDataWithCredential(credential)
            .then(res => {
                this.user = res;
                this.presentToast( 'Successfully signed in!' );
                this.router.navigate(['/home']);
            })
            .catch(err => {
                this.presentAlert( 'Failed to sign in via Google');
                console.log('Something is wrong:', err.message);
            });
    }

}
