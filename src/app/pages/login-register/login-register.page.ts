import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentification.service';
import {ModalController, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {CropImgComponent} from "../../modals/crop-img/crop-img.component";
import {Network} from "@capacitor/core";
import {PhotoService} from "../../services/photo.service";
import {OcrProviderService} from "../../services/ocr-provider.service";

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.page.html',
  styleUrls: ['./login-register.page.scss'],
})
export class LoginRegisterPage implements OnInit {

  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
  }

  signInGoogle() {
    this.authService.signInWithGoogle();
  }

  signInFacebook() {
    this.authService.signInWithFacebook();
  }
}
