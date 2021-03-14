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
  private fbToken = null;
  private fbLogin: FacebookLoginPlugin;

  constructor(private auth: AngularFireAuth,
              private router: Router,
              private http: HttpClient,
              private popupService: PopupService) {

    this.fbLogin = FacebookLogin;
    this.auth.authState.subscribe(user => { console.log('userhchange', user); this.user = user; });
  }

  /* Sign up */
  SignUp(email: string, password: string): Promise<void> {
      return new Promise((resolve, reject) => {
          this.auth.createUserWithEmailAndPassword(email, password)
              .then(
                  user => { // Creation succeeded
                      user.user.sendEmailVerification(null)
                          .then(() => {
                              this.auth.signOut()
                                  .then(resolve)
                                  .catch(reject);
                              this.popupService.presentAlert( 'Successfully signed up! Check your mail box' );
                              this.router.navigate(['/login']);
                          })
                          .catch(error => {
                              // Error occurred. Inspect error code.
                              reject(error);
                          });
                  })
              .catch(err => { // Creation failed
                  let errMsg = 'Unknown error';

                  switch (err.code) {
                      case 'auth/invalid-email':
                          errMsg = 'Invalid Email';
                          break;
                      case 'auth/email-already-in-use':
                          errMsg = 'Email already use';
                          break;
                      case 'auth/weak-password':
                          errMsg = 'Password is too weak';
                          break;
                  }

                  reject(errMsg);
              });
      });
  }

    /* Sign in */
    SignIn(email: string, password: string): Promise<firebase.User> {
        return new Promise((resolve, reject) => {
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(async () =>
                this.auth.signInWithEmailAndPassword(email, password)
                    .then(user => {
                        if (user.user.emailVerified) {
                            this.router.navigateByUrl('/home', {replaceUrl: true});
                            resolve(user.user);
                        } else {
                            this.auth.signOut();
                            reject('Sorry, email is not verified');
                        }
                    })
                    .catch(err => {
                        let errMsg = 'Unknown error';

                        switch (err.code) {
                            case 'auth/invalid-email':
                                errMsg = 'Email is invalid';
                                break;
                            case 'auth/user-disabled':
                                errMsg = 'User is disabled';
                                break;
                            case 'auth/user-not-found':
                                errMsg = 'User not found';
                                break;
                        }

                        return reject(errMsg);
                    })
            );
        });
    }

  /* Sign out */
  SignOut() {
    this.auth.signOut();
  }

  PasswordRecovery(email: string): Promise<void> {
      return new Promise((resolve, reject) => {
          this.auth.sendPasswordResetEmail(email)
              .then(() => {
                  this.popupService.presentAlert( 'Email sent to ' + email);
                  this.router.navigate(['/login']);
                  resolve();
              })
              .catch(err => {
                  let errMsg = 'Unknown error';

                  switch (err.code) {
                      case 'auth/invalid-email':
                          errMsg = 'Email is invalid';
                          break;
                      case 'auth/user-not-found':
                          errMsg = 'User not found';
                          break;
                  }

                  reject(errMsg);
              });
      });
  }

async isLoggedIn(): Promise<boolean> {
    const u = await this.auth.authState.toPromise();
    console.log(firebase.auth().currentUser);
    return u !== null;
  }

    async signInWithFacebook() {
        const FACEBOOK_PERMISSIONS = ['email', 'user_birthday'];
        const result = await this.fbLogin.login({ permissions: FACEBOOK_PERMISSIONS });

        if (result.accessToken && result.accessToken.userId) {
            this.fbToken = result.accessToken;
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
            this.fbToken = result.accessToken;
            this.loadUserData();
        } else {
            // Not logged in.
        }
    }

    async loadUserData(): Promise<firebase.User> {
        const url = `https://graph.facebook.com/${this.fbToken.userId}?fields=id,name,picture.width(720),birthday,email&access_token=${this.fbToken.fbToken}`;
        this.user = await this.http.get(url);
        if (this.user === null){
            await this.popupService.presentAlert('Facebook Login Failed');
            return;
        }
        const credential = firebase.auth.FacebookAuthProvider.credential(this.fbToken.fbToken);
        return new Promise((resolve, reject) => {
            this.auth.signInAndRetrieveDataWithCredential(credential)
                .then(() => {
                    this.popupService.presentToast('Successfully signed in!');
                    this.router.navigate(['/home']);
                    resolve();
                })
                .catch(err => {
                    let errMsg = 'Unknown error';
                    switch (err.code) {
                        case 'auth/invalid-email':
                            errMsg = 'Email is invalid';
                            break;
                        case 'auth/user-disabled':
                            errMsg = 'User is disabled';
                            break;
                        case 'auth/user-not-found':
                            errMsg = 'User not found';
                            break;
                        case 'auth/wrong-password':
                            errMsg = 'Wrong password';
                            break;
                    }
                    this.popupService.presentAlert(errMsg);
                    reject(errMsg);
                });
        });

  }


  async logout(): Promise<void> {
      return new Promise((resolve, reject) => {
          if (this.auth.currentUser) {
              this.auth.signOut()
                  .then(() => {
                      this.router.navigate(['/loginRegister']);
                      if (this.fbToken) { this.FbLogout(); }
                      console.log('LOG Out');
                      this.user = null;
                      resolve();
                  }).catch((error) => {
                  reject();
              });
          }
      });
  }

    private async FbLogout() {
        await this.fbLogin.logout();
        this.fbToken = null;
    }

    get userId(): string {
        return this.user.uid;
    }
    get userEmail(): string {
      return this.user.email;
    }

    get authState(): Observable<firebase.User> {
        return this.auth.authState;
    }

    async signInWithGoogle(): Promise<firebase.User> {

        const googleUser = await Plugins.GoogleAuth.signIn() as any;
        const credential = firebase.auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
        return new Promise((resolve, reject) => {
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(async () =>
                this.auth.signInAndRetrieveDataWithCredential(credential)
                    .then(() => {
                        this.popupService.presentToast('Welcome back !', 1000);
                        this.router.navigate(['/home']);
                        resolve();
                    })
                    .catch(err => {
                        let errMsg = 'Unknown error';
                        switch (err.code) {
                            case 'auth/invalid-email':
                                errMsg = 'Email is invalid';
                                break;
                            case 'auth/user-disabled':
                                errMsg = 'User is disabled';
                                break;
                            case 'auth/user-not-found':
                                errMsg = 'User not found';
                                break;
                            case 'auth/wrong-password':
                                errMsg = 'Wrong password';
                                break;
                        }
                        this.popupService.presentAlert(errMsg);
                        reject(errMsg);

                    })
            );
        });

  }

}
