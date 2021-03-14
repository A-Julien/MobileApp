import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AuthenticationService} from '../../services/authentification.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import firebase from 'firebase';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {

  user: Observable<firebase.User>;
  readonly version = '0.0.5';

  constructor(
      private auth: AngularFireAuth,
      private authService: AuthenticationService,
      private router: Router
  ) {
    this.user = this.authService.authState;
  }

  ngOnInit() {
  }

  async logout() {
   await this.authService.logout();
  }
}
