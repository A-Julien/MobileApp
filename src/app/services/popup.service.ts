import { Injectable } from '@angular/core';
import {AlertController, LoadingController, MenuController, PopoverController, ToastController} from '@ionic/angular';
import {ShareHistoryComponent} from '../popOvers/share-history/share-history.component';

import {
    Plugins,
    HapticsImpactStyle
} from '@capacitor/core';


const { Haptics } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(private toastController: ToastController,
              private alertController: AlertController,
              private loadingController: LoadingController) { }

 public async presentToast(msg: string, timeToShow = 5000) {
    const toast = await this.toastController.create({
      message: msg,
      duration: timeToShow,
      mode: 'ios'
    });
    toast.present();
  }


  public async presentAlert(msg: string, header: string = 'Alert') {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      // subHeader: 'Subtitle',
      message: msg,
      mode: 'ios',
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

    public hapticsImpact(style = HapticsImpactStyle.Heavy) {
        try {
            Haptics.impact({
                style
            });
        } catch (err){
            console.log(err);
        }
    }
}
