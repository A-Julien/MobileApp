import { Injectable } from '@angular/core';
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
  public readonly DOCUMENT_TEXT_TYPE = 'DOCUMENT_TEXT_DETECTION';
  public readonly DOCUMENT_HAND_TYPE = 'DOCUMENT_HAND_DETECTION';

  constructor(
      private popUpService: PopupService,
      private loadingController: LoadingController,
      private http: HttpClient
  ) {}

  OnLineOcrGoogleVisio(base64Image: string, detectionType: string) {
    console.log(base64Image);
    console.log('GOOGOLE');
    let body: any = {
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
    if (detectionType === this.DOCUMENT_HAND_TYPE){
      body = {
        requests: [
          {
            image: {
                content: base64Image
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION'
              }
            ],
            imageContext: {
              languageHints: ['fr-t-i0-handwrit']
            }
          }
        ]
      };
    }
    // tslint:disable-next-line:max-line-length
    this.http.post('https://eu-vision.googleapis.com/v1/images:annotate?key=' + environment.googleCloudVisionAPIKey, JSON.stringify(body))
        .subscribe(data => {
          console.log(data);
        }
    );
  }

  public async offLineOcrTesseract(picture){
    console.log('INPGOTO');
    console.log(picture);
    const loader = await this.presentLoading();
    await this.worker.load();
    await this.worker.loadLanguage('fra');
    await this.worker.initialize('fra');
    console.log('INPGOTO');
    const { data: { text } } = await this.worker.recognize(picture);
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
