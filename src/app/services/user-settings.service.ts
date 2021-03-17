import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {USettings, USettingsToFirebase} from '../models/settings';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {AuthenticationService} from './authentification.service';
import {AngularFireAuth} from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  private readonly USERSETTINGCOLLECTION = '/UserSetting';
  private UsCollection: AngularFirestoreCollection;

  constructor(
      private afs: AngularFirestore,
      private auth: AngularFireAuth
  ) {
    this.UsCollection = this.afs.collection(this.USERSETTINGCOLLECTION);
  }

  public async createUsettings(userUid: string): Promise<void> {
    const us = new USettings(userUid);
    us.forceOfflineOcr = false;

    await this.UsCollection.ref.withConverter(USettingsToFirebase).add(us);
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

  public updateUs(us: USettings): Promise<void> {
    return this.UsCollection.doc(us.id).ref.withConverter(USettingsToFirebase).set(us);
  }

  get UserSettings(): Observable<USettings>{
    return this.auth.authState.pipe(
        switchMap(user => user ? this.afs.collection(this.USERSETTINGCOLLECTION,
                ref => ref.where('userUid', '==', user.uid)).snapshotChanges() : of()),
        map(actions => {
           return  (this.convertSnapData<USettings>(actions))[0];
        })
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
