import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {BehaviorSubject, Observable} from 'rxjs';
import firebase from 'firebase';
import {Router} from '@angular/router';
import {AlertController, ToastController} from '@ionic/angular';
import {Plugins, registerWebPlugin} from '@capacitor/core';
import '@codetrix-studio/capacitor-google-auth';
import {FacebookLogin, FacebookLoginPlugin} from '@capacitor-community/facebook-login';
import {HttpClient} from '@angular/common/http';
import {PopupService} from './popup.service';
import {UserInfoService} from './user-info.service';

registerWebPlugin(FacebookLogin);

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  private user = null;
  private fbToken = null;
  private fbLogin: FacebookLoginPlugin;

  public u$ = new BehaviorSubject<firebase.User>(null);

  constructor(private auth: AngularFireAuth,
              private router: Router,
              private http: HttpClient,
              private popupService: PopupService,
              private userInfoService: UserInfoService) {

    this.auth.onAuthStateChanged(user => {
        this.u$.next(user);
    });

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
                    .then( async user => {
                        if (user.user.emailVerified) {
                            await this.userInfoService.uSexist(user.user.uid);
                            if (this.userInfoService.userInfo.isNew){
                                await this.router.navigateByUrl('/welcome', {replaceUrl: true});
                                await this.userInfoService.notANewUser();
                                return resolve(user.user);
                            }
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
                            default:
                                errMsg = err;
                                break;
                        }

                        reject(errMsg);
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
                  this.popupService.presentAlert(errMsg, 'Password recovery failed !');
                  // reject(errMsg);
              });
      });
  }

async isLoggedIn(): Promise<boolean> {
    const u = await this.auth.authState.toPromise();
    console.log(firebase.auth().currentUser);
    return u !== null;
  }


    async signInWithFacebook(): Promise<firebase.User> {
        const FACEBOOK_PERMISSIONS = [
            'email',
            'user_birthday',
            'user_photos',
            'user_gender',
        ];

        const result = await Plugins.FacebookLogin.login({
            permissions: FACEBOOK_PERMISSIONS,
        });
        if (result && result.accessToken) {
            this.fbToken = result.accessToken;
            const credential = firebase.auth.FacebookAuthProvider.credential(result.accessToken.token);
            return new Promise((resolve, reject) => {
                this.auth.signInAndRetrieveDataWithCredential(credential)
                    .then(async (user) => {
                        await this.userInfoService.uSexist(user.user.uid);
                        if (this.userInfoService.userInfo.isNew){
                            await this.router.navigateByUrl('/welcome', {replaceUrl: true});
                            await this.userInfoService.notANewUser();
                            return resolve(user.user);
                        }
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
                            default:
                                errMsg = err.code;
                                break;
                        }
                        this.popupService.presentAlert(errMsg);
                        reject(errMsg);
                    });
            });
        }

  }


  async logout(): Promise<void> {
      return new Promise((resolve, reject) => {
              this.auth.signOut()
                  .then(() => {
                      if (this.fbToken) { this.FbLogout(); }
                      console.log('LOG Out');
                      this.user = null;
                      this.router.navigate(['/loginRegister']);
                      resolve();
                  }).catch((error) => {
                  reject();
              });
      });
  }

    private async FbLogout() {
        this.fbToken = null;
        await Plugins.FacebookLogin.logout();
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
                    .then(async (user) => {
                        await this.userInfoService.uSexist(user.user.uid);
                        if (this.userInfoService.userInfo.isNew){
                            console.log('auth new');
                            await this.router.navigateByUrl('/welcome', {replaceUrl: true});
                            await this.userInfoService.notANewUser();
                            return resolve(user.user);
                        }
                        console.log('auth pas new');
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
