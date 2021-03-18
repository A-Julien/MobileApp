import { Injectable } from '@angular/core';
import {PopupService} from './popup.service';
import {LoadingController} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';


const { createWorker, createScheduler } = require('tesseract.js');
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OcrProviderService {
  private scheduler = createScheduler();
  private worker1;
  private worker2;

  public readonly DOCUMENT_TEXT_TYPE = 'DOCUMENT_TEXT_DETECTION';
  public readonly DOCUMENT_HAND_TYPE = 'DOCUMENT_HAND_DETECTION';

  constructor(
      private popUpService: PopupService,
      private loadingController: LoadingController,
      private http: HttpClient
  ) {
    this.worker1 = createWorker({
      workerPath: '/assets/lib/worker.min.js',
      langPath: '/assets/lang-data',
      corePath: '/assets/lib/tesseract-core.wasm.js',
      logger: m => console.log(m),
      /*langPath: '../../assets/lang-data',
      logger: m => console.log(m), // Add logger here*/
     });

    this.worker2 = createWorker({
      workerPath: '/assets/lib/worker.min.js',
      langPath: '/assets/lang-data',
      corePath: '/assets/lib/tesseract-core.wasm.js',
      logger: m => console.log(m),
      /*langPath: '../../assets/lang-data',
      logger: m => console.log(m), // Add logger here*/
    });
}

  OnLineOcrGoogleVisio(base64Image: string, detectionType: string) {
    console.log(base64Image);
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
    return this.http.post('https://eu-vision.googleapis.com/v1/images:annotate?key=' + environment.googleCloudVisionAPIKey, JSON.stringify(body));

  }

  public async offLineOcrTesseract(picture) {
    console.log('INPGOTO');
    console.log(picture);
    await this.worker1.load();
    await this.worker2.load();
    await this.worker1.loadLanguage('fra');
    await this.worker1.initialize('fra');
    await this.worker2.loadLanguage('fra');
    await this.worker2.initialize('fra');

    console.log('lanch worker');
    /*const results = await Promise.all(Array(10).fill(0).map(() => (
        this.scheduler.addJob('recognize', picture)
    )));
    console.log(results);
    await this.scheduler.terminate(); // It also terminates all workers.
    return results;*/
    console.log('INPGOTO');
    const { data: { text } } = await this.worker1.recognize(picture);
    await this.worker1.terminate();
    return text;
  }


}
