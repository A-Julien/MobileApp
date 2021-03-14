import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AuthenticationService} from '../../services/authentification.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {

  userEmail: string;
  readonly version = '0.0.5';

  constructor(
      private auth: AngularFireAuth,
      private authService: AuthenticationService,
      private router: Router
  ) { }

  ngOnInit() {
    this.auth.authState.subscribe( user => this.userEmail = user.email);
  }

  async logout() {
   await this.authService.logout();
  }
}
