import { Injectable } from '@angular/core';
import {CameraPhoto} from '@capacitor/core';
import {PopupService} from './popup.service';
import {LoadingController} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';


const { createWorker } = require('tesseract.js');
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OcrProviderService {
  private worker = createWorker({
    langPath: '../../assets/lang-data',
    logger: m => console.log(m), // Add logger here
  });

  constructor(
      private popUpService: PopupService,
      private loadingController: LoadingController,
      private http: HttpClient
  ) {}

  getLabels(base64Image: string) {
    console.log(base64Image);
    console.log('GOOGOLE');
    const body = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            }
          ]
        }
      ]
    };
    console.log('GOOGOLE2');

    const s = this.http.post('https://eu-vision.googleapis.com/v1/images:annotate?key=' + environment.googleCloudVisionAPIKey, JSON.stringify(body))
        .subscribe(data => {
          console.log(data);
        }
    );
  }

  public async recognize(picture: CameraPhoto){
    console.log('INPGOTO');
    const loader = await this.presentLoading();

    await this.worker.load();
    await this.worker.loadLanguage('fra');
    await this.worker.initialize('fra');
    const { data: { text } } = await this.worker.recognize(picture.webPath);
    console.log(text);
    loader.dismiss();
    this.popUpService.presentAlert(text);
    await this.worker.terminate();
  }

  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...'
    });
    await loading.present();
    return loading;

  }
}
