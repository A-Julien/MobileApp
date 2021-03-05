import { Injectable } from '@angular/core';
import {AlertController, ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(private toastController: ToastController,
              private alertController: AlertController) { }

 public async presentToast(msg: string, timeToShow = 5000) {
    const toast = await this.toastController.create({
      message: msg,
      duration: timeToShow
    });
    toast.present();
  }

  public async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      // subHeader: 'Subtitle',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }
}
