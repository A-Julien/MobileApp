import { Injectable } from '@angular/core';
import {AuthenticationService} from './authentification.service';
import {MenuController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class MenuGuardService {

  constructor(
      private auth: AuthenticationService,
      private menuController: MenuController
  ) {}

  setMenuGuard(){
    this.auth.u$.subscribe(user => user ? this.menuController.enable(true) : this.menuController.enable(false));
  }
}
