import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {uInfoToFirebase, UserInfo} from '../models/userinfo';
import firebase from 'firebase';
import {List} from '../models/list';
import {Category, catToFirebase} from '../models/category';
import {Todo} from '../models/todo';
import {PopupService} from './popup.service';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  private readonly USERINFOCOLLECTION = '/UserInfo';
  private readonly USERINFOCATEGORIES = 'Categories';
  private uInfoCollection: AngularFirestoreCollection;

  private activeCategory: Category;

  // tslint:disable-next-line:variable-name
  private _userInfo: UserInfo;
  // tslint:disable-next-line:variable-name
  private _userInfoOb$: Observable<UserInfo>;
  // tslint:disable-next-line:variable-name
  private _userCat$: Observable<Category[]>;
  private uInfoId: string;
  public activeCategory$ = new BehaviorSubject<Category>(null);

  constructor(
      private afs: AngularFirestore,
      private auth: AngularFireAuth,
      private popupService: PopupService
  ) {

    this.activeCategory$.subscribe( cat => this.activeCategory = cat);

    this.uInfoCollection = this.afs.collection(this.USERINFOCOLLECTION);
    this._userInfoOb$ =  this.auth.authState.pipe(
        switchMap(user => user ?
            this.afs.collection(this.USERINFOCOLLECTION, ref => ref.where('userUid', '==', user.uid)).snapshotChanges() : of()),
        map(actions => {
          return (this.convertSnapUfin<UserInfo>(actions))[0];
        }),
        tap(u => u ? this.uInfoId = u.id : this.uInfoId = '')
    );

    this._userCat$ = this._userInfoOb$.pipe(
        switchMap( info =>  info ?
          this.uInfoCollection.doc(info.id).collection<Category>(this.USERINFOCATEGORIES).snapshotChanges() : of([])),
        map(actions => this.convertSnapUfin<Category>(actions))
    );

    this.auth.authState.subscribe( user => {
      if (user){
        this.activeCategory$.next(new Category('None'));
      }
    });
  }

  public async createUsettings(userUid: string): Promise<void> {
    this._userInfo = new UserInfo(userUid);
    this._userInfo.isNew = true;
    this._userInfo.categories.push('None');

    await this.uInfoCollection.ref.withConverter(uInfoToFirebase).add(this._userInfo);
  }


  get userCat$(): Observable<Category[]> {
    return this._userCat$;
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

  public async addCategory(cat: Category){
    return  this.uInfoCollection.doc(this.uInfoId).collection('Categories').ref.withConverter(catToFirebase).add(cat);
  }

  public async addListToCategory(listId: string, category: Category){
    const rmCat = async () => {
      const col = this.uInfoCollection.doc(this.uInfoId)
          .collection(this.USERINFOCATEGORIES, ref => ref.where('lists', 'array-contains-any', [listId]));
      const uSnaps = await col.get().toPromise();

      if (uSnaps.docs[0]){
        const catToRm = this.convertSnapData<Category>(uSnaps.docs[0]);
        await this.uInfoCollection.doc(this.uInfoId).collection(this.USERINFOCATEGORIES).doc(catToRm.id).update({
          lists: firebase.firestore.FieldValue.arrayRemove(listId)
        });
      }

    };
    await rmCat();

    return this.updateListToCategory(listId, category);
  }

  public async updateListToCategory(listId: string, category: Category){
    if (!category.lists) { category.lists = []; }
    category.lists.push(listId);

    return this.uInfoCollection.doc(this.uInfoId).collection(this.USERINFOCATEGORIES)
              .doc(category.id).ref.withConverter(catToFirebase).set(category)
        .then(() => this.setActiveCategory(category));
  }

  private updateUserInfo(userInfo: UserInfo): Promise<void> {
    return this.uInfoCollection.doc(userInfo.id).ref.withConverter(uInfoToFirebase).set(userInfo);
  }

  public removeCategory(category: Category){
    this.uInfoCollection.doc(this.uInfoId).collection(this.USERINFOCATEGORIES).doc(category.id).delete()
        .then(() => this.popupService.presentToast('list ' + category.name + ' removed', 1000))
        .catch(() => this.popupService.presentAlert('An error was occurred can not delete ' + category.name));
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

  setActiveCategory(caterogy: Category){
    if (!caterogy.lists) {caterogy.lists = []; }
    this.activeCategory$.next(caterogy);
  }
}
