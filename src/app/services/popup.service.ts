import { Injectable } from '@angular/core';
import {AlertController, LoadingController, PopoverController, ToastController} from '@ionic/angular';
import {ShareHistoryComponent} from '../popOvers/share-history/share-history.component';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(private toastController: ToastController,
              private alertController: AlertController,
              private loadingController: LoadingController,
              private popOverController: PopoverController) { }

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

    public async presentLoading(text: string): Promise<HTMLIonLoadingElement> {
        const loading = await this.loadingController.create({
            cssClass: 'my-custom-class',
            message: text
        });
        await loading.present();
        return loading;
    }
}
