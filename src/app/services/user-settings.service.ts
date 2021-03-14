import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {USettings, USettingsToFirebase} from '../models/settings';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {AngularFireAuth} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  private readonly USERSETTINGCOLLECTION = '/UserSetting';
  private UsCollection: AngularFirestoreCollection<USettings>;

  constructor(
      private afs: AngularFirestore,
      private auth: AngularFireAuth
  ) {
    this.UsCollection = this.afs.collection<USettings>(this.USERSETTINGCOLLECTION);
  }

  public async createUsettings(userUid: string): Promise<void> {
    const us = new USettings(userUid);
    us.forceOfflineOcr = false;

    this.UsCollection.ref.withConverter(USettingsToFirebase).add(us);
  }

  uSexist(userUid: string) {
    console.log('WESHE');
    this.afs.collection<USettings>(this.USERSETTINGCOLLECTION,
        ref => ref.where('userUid', '==', userUid)).snapshotChanges().subscribe(res => {
      if (res.length <= 0) {
       this.createUsettings(userUid);
      }
    });

  }

  get UserSettings(): Observable<USettings>{
    return this.auth.authState.pipe(
        switchMap(user => this.afs.collection(this.USERSETTINGCOLLECTION,
                ref => ref.where('userUid', '==', user.uid)).snapshotChanges()),
        map(actions => this.convertSnapData<USettings>(actions))
    );
  }

  private convertSnapData<T>(datas){
    return datas.map( res => {
      const data = res.payload.doc.data();
      const id = res.payload.doc.id;
      return {id, ...data } as T;
    });

  }
}
