import { Injectable } from '@angular/core';
import {AlertController} from "@ionic/angular";
import firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

  constructor(private alertCtrl: AlertController) { }

  changePassword() {
    /* console.log('Change Password Button Clicked');
    const alert = this.alertCtrl.create({
      id: 'Change Password',
      inputs: [
        {
          name: 'oldPassword',
          placeholder: 'Your old password..',
          type: 'password'
        },
        {
          name: 'newPassword',
          placeholder: 'Your new password..',
          type: 'password'
        },
        {
          name: 'newPasswordConfirm',
          placeholder: 'Confirm your new password..',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Update Password',
          handler: data => {
            // First you get the current logged in user
            const cpUser = firebase.auth().currentUser;

            /*Then you set credentials to be the current logged in user's email
            and the password the user typed in the input named "old password"
            where he is basically confirming his password just like facebook for example.

            const credentials = firebase.auth.EmailAuthProvider.credential(
                cpUser.email, data.oldPassword);

            // Reauthenticating here with the data above
            cpUser.reauthenticateWithCredential(credentials).then(
                success => {
                  if (data.newPassword !== data.newPasswordConfirm){
                    const alert = this.alertCtrl.create({
                      id: 'Change Password Failed',
                      message: 'You did not confirm your password correctly.',
                      buttons: ['Try Again']
                    });
                    alert.present();
                  } else if (data.newPassword.length < 6){
                    let alert = this.alertCtrl.create({
                      id: 'Change Password Failed',
                      message: 'Your password should be at least 6 characters long',
                      buttons: ['Try Again']
                    });
                    alert.present();
                  } else {
                    let alert = this.alertCtrl.create({
                      title: 'Change Password Success',
                      message: 'Your password has been updated!',
                      buttons: ['OK']
                    });
                    alert.present();
                    ///Update the password to the password the user typed into the new password input field
                    cpUser.updatePassword(data.newPassword).then(function(){
                      //Success
                    }).catch(function(error){
                      //Failed
                    });
                  }
                },
                error => {
                  console.log(error);
                  if (error.code === 'auth/wrong-password'){
                    let alert = this.alertCtrl.create({
                      title: 'Change Password Failed',
                      message: 'Your old password is invalid.',
                      buttons: ['Try Again']
                    });
                    alert.present();
                  }
                }
            )
            console.log(credentials);
          }
        }
      ]
    });
    alert.present();
  }*/
  }
}
