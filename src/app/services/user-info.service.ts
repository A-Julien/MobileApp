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
      console.log('coucou');
      const col = this.afs.collection(this.USERINFOCOLLECTION, ref => ref.where('userUid', '==', userUid));
      console.log(col);
      const uSnaps = await col.get().toPromise();
      console.log(uSnaps);
      if (uSnaps.docs.length <= 0) {
        await this.createUsettings(userUid);
      } else {
        this._userInfo = this.convertSnapData(uSnaps.docs[0]);
      }
      /*for (const doc of uSnaps.docs){
        console.log(doc.id, '=>', doc.data());
      }*/
      // const uf = this.convertSnapData<UserInfo>(uSnaps.docs);
      /*if (uSnap.length <= 0) {
        await this.createUsettings(userUid);
      } else {
        console.log('existeEeee', (this.convertSnapData<UserInfo>(res))[0]);
        this._userInfo = (this.convertSnapData<UserInfo>(res))[0];
      }*/
    };
    await uinf();

    /*console.log('WESHE');
    const c = await this.afs.collection<UserInfo>(this.USERINFOCOLLECTION,
        ref => ref.where('userUid', '==', userUid)).snapshotChanges().(async res => {
      if (res.length <= 0) {
        await this.createUsettings(userUid);
      } else {
        console.log('existeEeee', (this.convertSnapData<UserInfo>(res))[0]);
        this._userInfo = (this.convertSnapData<UserInfo>(res))[0];
      }
    });*/

    /*await this.afs.collection(this.USERINFOCOLLECTION, ref => ref.where('userUid', '==', userUid)).snapshotChanges().pipe(
        map( res => {
          console.log('WESHSHSHSHSHS', res);
          console.log((this.convertSnapData<UserInfo>(res)));
          if (!res) {
                this.createUsettings(userUid);
                return;
              }
          console.log((this.convertSnapData<UserInfo>(res)));
          this._userInfo = (this.convertSnapData<UserInfo>(res));
            }
        ), toPromise());*/
    /*await this.afs.collection<UserInfo>(this.USERINFOCOLLECTION,
        ref => ref.where('userUid', '==', userUid)).get().pipe(
            map( res => {
                  if (!res) {
                    this.createUsettings(userUid);
                    return;
                  }
                  console.log((this.convertSnapData<UserInfo>(res)));
                  this._userInfo = (this.convertSnapData<UserInfo>(res));
                }
            )
    );*/
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

  /*public getUserInfo(userUid: string): Observable<UserInfo>{
    console.log('get USER');

    return this.afs.collection(this.USERINFOCOLLECTION,
            ref => ref.where('userUid', '==', userUid)).snapshotChanges().pipe(
        tap(console.log),
        map(actions => {
          console.log('weshconvert', actions);
          const t =  this.convertSnapData<UserInfo>(actions);
          console.log('Weh', t);
          return t;
        })
    );*/

    /*return this.afs.collection(this.USERINFOCOLLECTION,
        ref => ref.where('userUid', '==', userUid)).snapshotChanges().pipe(
        tap(console.log),
        map(actions => {
          return  (this.convertSnapData<UserInfo>(actions));
        })
    ).toPromise();
  }*/

  private convertSnapData<T>(d){
      const data = d.data();
      const id = d.id;
      return {id, ...data } as T;
  }
}
