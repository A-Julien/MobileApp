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
import {PopupService} from './popup.service';

registerWebPlugin(FacebookLogin);

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  private user = null;
  private token = null;
  private fbLogin: FacebookLoginPlugin;

  constructor(private auth: AngularFireAuth,
              private router: Router,
              private http: HttpClient,
              private popupService: PopupService) {

    this.fbLogin = FacebookLogin;
    this.auth.authState.subscribe(user => {this.user = user; });
    this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

  }

  /* Sign up */
  SignUp(email: string, password: string) {
    this.auth
        .createUserWithEmailAndPassword(email, password)
        .then(res => {
          console.log('Successfully signed up!', res);
          this.popupService.presentAlert( 'Successfully signed up! Check your mail box' );
          res.user.sendEmailVerification();
          this.router.navigate(['/login']);
        })
        .catch(error => {
            this.popupService.presentAlert( 'Something is wrong:' + error.message);
            console.log('Something is wrong:', error.message);
        });
  }

  /* Sign in */
  SignIn(email: string, password: string) {
    this.auth
        .signInWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user.emailVerified) {
              this.user = res.user;
              console.log(this.user);
              console.log('Successfully signed in!');
              this.popupService.presentToast( 'Successfully signed in!' );
              this.router.navigate(['/home']);
          } else {
                this.popupService.presentAlert( 'Failed to sign in, email is not verified');
                console.log('Email not verified');
          }
        })
        .catch(err => {
            this.popupService.presentAlert( 'Failed to sign in, email or password does not exist');
            console.log('Something is wrong:', err.message);
        });
  }

  /* Sign out */
  SignOut() {
    this.auth.signOut();
  }

  PasswordRecovery(email: string) {
      this.auth
          .sendPasswordResetEmail(email)
          .then(res => {
              console.log('Email sent');
              this.popupService.presentAlert( 'Email sent to ' + email);
              this.router.navigate(['/login']);
          })
          .catch(err => {
              this.popupService.presentAlert( 'Email not found' + err.message);
              console.log('Something is wrong:', err.message);
          });
  }

  isLoggedIn(): boolean {
    console.log(this.user);
    return this.user != null;
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
            this.popupService.presentAlert('Facebook Login Failed');
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
            await this.popupService.presentAlert('Facebook Login Failed');
            return;
        }
        const credential = firebase.auth.FacebookAuthProvider.credential(this.token.token);
        this.auth.signInAndRetrieveDataWithCredential(credential)
            .then(res => {
                this.user = res;
                this.popupService.presentToast( 'Successfully signed in!' );
                this.router.navigate(['/home']);
            })
            .catch(err => {
                this.popupService.presentAlert( 'Failed to sign in via facebook');
                console.log('Something is wrong:', err.message);
            });

  }

    async FbLogout() {
        await this.fbLogin.logout();
        this.user = null;
        this.token = null;
    }

    public getUserId(): string {
        return this.user.uid;
    }
    public getUserEmail(): string {
      return this.user.email;
    }

    get authState(): Observable<firebase.User> {
        return this.auth.authState;
    }

    async signInWithGoogle() {

        const googleUser = await Plugins.GoogleAuth.signIn() as any;
        const credential = firebase.auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => {
                this.signInWithGoogle();

        this.auth.signInAndRetrieveDataWithCredential(credential)
            .then(res => {
                this.user = res.user;
                this.popupService.presentToast( 'Welcome back !', 1000 );
                this.router.navigate(['/home']);
            })
            .catch(err => {
                this.popupService.presentAlert( 'Failed to sign in via Google');
                console.log('Something is wrong:', err.message);
            });
            });
    }

}
