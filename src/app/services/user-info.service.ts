import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {uInfoToFirebase, UserInfo} from '../models/userinfo';
import firebase from 'firebase';
import {List} from '../models/list';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  private readonly USERINFOCOLLECTION = '/UserInfo';
  private uInfoCollection: AngularFirestoreCollection;

  // tslint:disable-next-line:variable-name
  private _userInfo: UserInfo;
  private _userInfoOb$: Observable<UserInfo>;

  public activeCategory$ = new BehaviorSubject<string>(null);

  constructor(
      private afs: AngularFirestore,
      private auth: AngularFireAuth
  ) {
    this.uInfoCollection = this.afs.collection(this.USERINFOCOLLECTION);
    this._userInfoOb$ =  this.auth.authState.pipe(
        switchMap(user => user ?
            this.afs.collection(this.USERINFOCOLLECTION, ref => ref.where('userUid', '==', user.uid)).snapshotChanges() : of()),
        map(actions => (this.convertSnapUfin<UserInfo>(actions))[0])
    );

    this.auth.authState.subscribe( user => {
      if (user){
        this.activeCategory$.next('None');
      }
    });
  }
  public async createUsettings(userUid: string): Promise<void> {
    this._userInfo = new UserInfo(userUid);
    this._userInfo.isNew = true;
    this._userInfo.categories.push('None');

    await this.uInfoCollection.ref.withConverter(uInfoToFirebase).add(this._userInfo);
  }


  get userInfoOb$(): Observable<UserInfo> {
    return this._userInfoOb$;
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

  public async addCategory(CatName: string){

    await this._userInfoOb$.pipe(
        switchMap( uInfo => {
          return this.afs.collection(this.USERINFOCOLLECTION).doc(uInfo.id).update({
            categories: firebase.firestore.FieldValue.arrayUnion(CatName)
          });
        })
    ).toPromise();

    /*return this.afs.collection(this.USERINFOCOLLECTION).doc(this._userInfo.id).update({
      categories: firebase.firestore.FieldValue.arrayUnion(CatName)
    });*/
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

  private convertSnapUfin<T>(datas){
    return datas.map( res => {
      const data = res.payload.doc.data();
      const id = res.payload.doc.id;
      return {id, ...data } as T;
    });
  }

  setActiveCategory(caterogy: string){
    this.activeCategory$.next(caterogy);
  }
}
