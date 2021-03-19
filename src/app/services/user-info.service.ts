import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import {Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {uInfoToFirebase, UserInfo} from '../models/userinfo';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  private readonly USERINFOCOLLECTION = '/UserInfo';
  private uInfoCollection: AngularFirestoreCollection;

  // tslint:disable-next-line:variable-name
  private _userInfo: UserInfo;

  constructor(
      private afs: AngularFirestore,
      private auth: AngularFireAuth
  ) {
    this.uInfoCollection = this.afs.collection(this.USERINFOCOLLECTION);
  }

  public async createUsettings(userUid: string): Promise<void> {
    this._userInfo = new UserInfo(userUid);
    this._userInfo.isNew = true;

    await this.uInfoCollection.ref.withConverter(uInfoToFirebase).add(this._userInfo);
  }

  async uSexist(userUid: string) {
    console.log('EXIST USER', userUid);

    const uinf = async () => {
      const col = this.afs.collection(this.USERINFOCOLLECTION, ref => ref.where('userUid', '==', userUid));
      let uSnaps = await col.get().toPromise();
      if (uSnaps.docs.length <= 0) {
        console.log('not exist', uSnaps.docs );
        await this.createUsettings(userUid);
        uSnaps = await col.get().toPromise();
      }

      console.log('exist', uSnaps.docs );
      this._userInfo = this.convertSnapData(uSnaps.docs[0]);
      console.log('ufin', this._userInfo);
    };
    await uinf();
  }

  private updateUserInfo(userInfo: UserInfo): Promise<void> {
    return this.uInfoCollection.doc(userInfo.id).ref.withConverter(uInfoToFirebase).set(userInfo);
  }

  public notANewUser(): Promise<void>{
    this._userInfo.isNew = false;
    return this.updateUserInfo(this._userInfo);
  }


  get userInfo(): UserInfo {
    return this._userInfo;
  }


  private convertSnapData<T>(d){
      const data = d.data();
      const id = d.id;
      return {id, ...data } as T;
  }
}
