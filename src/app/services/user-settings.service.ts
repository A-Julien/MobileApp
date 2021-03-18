import {Injectable} from '@angular/core';
import {USettings} from '../models/settings';
import {BehaviorSubject} from 'rxjs';
import {Plugins} from '@capacitor/core';
import {AuthenticationService} from './authentification.service';

const { Storage } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  private curentUs: USettings;

  private curentUs$ = new BehaviorSubject<USettings>(new USettings(''));

  constructor(
      private auth: AuthenticationService
  ) {
    this.curentUs = null;

    this.auth.u$.subscribe(
        user => user ? this.getUs(user.uid) : this.logout()
    );
  }

  private logout(): void{
    console.log('LOGOUT');
    this.curentUs = null;
    this.curentUs$.next(new USettings(''));
  }


  public async createUsettings(userUid: string): Promise<void> {
    const us = new USettings('');
    us.userUid = userUid;
    us.forceOfflineOcr = false;

    return this.setObject(us);
  }

  async getUs(userUid: string): Promise<void> {
    await this.uSexist(userUid);
    const ret = await Storage.get({ key: userUid });
    this.curentUs =  new USettings(ret.value);
    this.curentUs$.next(this.curentUs);
  }

  private async uSexist(userUid: string) {
    const ret = await Storage.get({ key: userUid });
    if (!ret.value){
      await this.createUsettings(userUid);
    }
  }

  public updateUs(us: USettings): Promise<void> {
    return this.setObject(us);
  }

  private setObject(us: USettings ): Promise<void> {
    return  Storage.set({
      key: us.userUid,
      value: JSON.stringify(us)
    });
  }

  get UserSettings(): BehaviorSubject<USettings>{
    return this.curentUs$;
  }
}
