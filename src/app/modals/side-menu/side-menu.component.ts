import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentification.service';
import {AngularFireAuth} from "@angular/fire/auth";

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {

  userEmail: string;

  constructor(
      private auth: AngularFireAuth
  ) { }

  ngOnInit() {
    this.auth.authState.subscribe( user => this.userEmail = user.email);
  }

}
