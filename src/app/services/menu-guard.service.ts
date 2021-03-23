import { Injectable } from '@angular/core';
import {AuthenticationService} from './authentification.service';
import {MenuController} from '@ionic/angular';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MenuGuardService {

  private readonly meunuID = 'mainMenu';

  private menuState = true;

  constructor(
      private auth: AuthenticationService,
      private menuController: MenuController,
      private route: Router
  ) {
    this.route.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const urls = event.url.split('/');
        if (urls.length >= 4 && urls[urls.length - 2] === 'todo-details'){
          this.disableMenu();
          return;
        }
        this.enableMenu();
      }
    });
  }

private async enableMenu(){
    if (this.menuState) { return; }
    this.menuState = true;
    await this.menuController.enable(true, this.meunuID);
  }

private async disableMenu(){
  if (!this.menuState) { return; }
  this.menuState = false;
  await this.menuController.enable(false, this.meunuID);
  }

setMenuGuard(){
    this.auth.u$.subscribe(user =>
        user ? this.menuController.enable(true, this.meunuID) : this.menuController.enable(false, this.meunuID)
    );
  }
}
