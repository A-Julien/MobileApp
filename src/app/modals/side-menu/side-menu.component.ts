import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AuthenticationService} from '../../services/authentification.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import firebase from 'firebase';
import {EmailComposer} from '@ionic-native/email-composer/ngx';
import {UserSettingsService} from '../../services/user-settings.service';
import {USettings} from '../../models/settings';
import {ListService} from '../../services/list.service';
import {PopupService} from '../../services/popup.service';
import {ShareHistoryComponent} from '../../popOvers/share-history/share-history.component';
import {MenuController, PopoverController} from '@ionic/angular';
import {UserInfoService} from '../../services/user-info.service';
import {UserInfo} from '../../models/userinfo';
import {Category} from '../../models/category';
import {RmCatComponent} from '../../popOvers/rm-cat/rm-cat.component';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {

  user$: Observable<firebase.User>;
  userInfo$: Observable<UserInfo>;
  userCat$: Observable<Category[]>;
  readonly version = '0.8.5';
  forceOCR: boolean;
  private currentUs: USettings;
  private longPressActive = false;

  nbNotif: number;
  newCategory: string;

  constructor(
      private auth: AngularFireAuth,
      private authService: AuthenticationService,
      private router: Router,
      private emailComposer: EmailComposer,
      private uService: UserSettingsService,
      private listService: ListService,
      public popupService: PopupService,
      private popOverController: PopoverController,
      private uInfoService: UserInfoService,
      private menuCtrl: MenuController
  ) {
    this.newCategory = '';
    this.user$ = this.authService.authState;
    this.forceOCR = false;
    this.nbNotif = 0;
  }

  ngOnInit() {
    this.userInfo$ = this.uInfoService.userInfoOb$;
    this.userCat$ = this.uInfoService.userCat$;

    this.uService.UserSettings.subscribe((us) => {
          this.forceOCR = us.forceOfflineOcr;
          this.currentUs = us;
        }
    );
    const listsShared = this.listService.listShare$;

    listsShared?.subscribe(ml => {
      this.nbNotif = 0;
      ml.forEach(meta => {
        if (!meta.notify && meta.newOwner === this.authService.userEmail){
          this.nbNotif += 1;
        }
      });
    });
  }

  async longPress(ev, category) {
    setTimeout(async () => {
      this.popupService.hapticsImpact();
      console.log('longp', category);
      const popover = await this.popOverController.create({
        component: RmCatComponent,
        event: ev,
        mode: 'ios',
        translucent: true,
        id: 'rmCat',
        keyboardClose: true,
        showBackdrop: true
      });

      await popover.present();
      const { data } = await popover.onWillDismiss();
      console.log('DATA ', data);
      if (data) { this.uInfoService.removeCategory(category); }
      this.longPressActive = true;

    }, 500);
  }

  async logout() {
   await this.authService.logout();
  }

  async changeForceOcr(){
    this.currentUs.forceOfflineOcr = this.forceOCR;
    await this.uService.updateUs(this.currentUs);
  }

  sendMail(){
    const email = {
      to: 'julien.alaimo@gmail.com',
      subject: '[Tolist] Suggestion',
      body: 'Some improvement ? Tel Us !',
      isHtml: true
    };

    this.emailComposer.open(email);
  }

  public async popShareHistory(ev) {
    const popover = await this.popOverController.create({
      component: ShareHistoryComponent,
      cssClass: 'notif',
      event: ev,
      mode: 'ios',
      translucent: true,
      keyboardClose: true,
      showBackdrop: true
    });

    return await popover.present();
  }

  async addCategory() {
    const newCat = new Category(this.newCategory);
    newCat.lists.push('_catList_' + this.newCategory);
    await this.uInfoService.addCategory(newCat);
    this.newCategory = '';
  }

  async selectActiveCat(category: Category) {

    if (this.router.url !== '/home'){
      await this.menuCtrl.close();
      this.router.navigateByUrl('/home', {replaceUrl: true});
    } else {
      this.menuCtrl.close();
    }

    if (!category){
      this.uInfoService.setActiveCategory(new Category('None'));
      return;
    }
    this.uInfoService.setActiveCategory(category);
  }

  openInsta() {
    window.open('https://www.instagram.com/larouelibre4l/?fbclid=IwAR2364m6U0fzR75udlt_LPS-hOXlsCooVppsqI9yMGowwgaZEJd2Gp8OI_c', '_system');
  }

  openFb() {
    window.open('https://www.facebook.com/LaRoueLibre4L/', '_system');
  }

  openGithub() {
    window.open('https://github.com/A-Julien/MobileApp', '_system');
  }
}
