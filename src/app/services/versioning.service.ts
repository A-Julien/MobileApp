import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AlertController} from "@ionic/angular";
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit();

@Injectable({
  providedIn: 'root'
})
export class VersioningService {

  private readonly repo = 'MobileApp';
  private readonly owner = 'A-Julien';

  private readonly _version = '0.9.6.2';

  public readonly newVersion$ = new BehaviorSubject<number>(0);

  private newVersionUrl: string;
  private newTag: string;

  constructor(private alertCtrl: AlertController) {
    this.getRelease();
  }

  private async getRelease(){
    console.log('holla');
    const { data: res } = await octokit.request('GET /repos/{owner}/{repo}/releases', {
      owner: this.owner,
      repo: this.repo
    });
    this.newTag = res[0].tag_name;
    if (this.detectNewRelease(this.newTag)){
      console.log(res[0].tag_name);
      this.newVersionUrl = res[0].html_url;
      this.newVersion$.next(1);
    }
  }

  private detectNewRelease(tagName: string): boolean{
    return this._version !== tagName;
  }

  public async getNewVersion(){
    if (this.newVersionUrl){
      await this.presentAlertDownload()
    }
  }

  private async presentAlertDownload() {
    const alert = await this.alertCtrl.create({
      mode: 'ios',
      header: 'New Version !',
      message:  'Version <strong>' + this.newTag + '</strong> available !',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Download',
          handler: () => {
            window.open(this.newVersionUrl, '_system');
          }
        }
      ]
    });

    await alert.present();
  }


  get version(): string {
    return this._version;
  }
}
