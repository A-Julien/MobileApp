import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginRegisterPageRoutingModule } from './login-register-routing.module';

import { LoginRegisterPage } from './login-register.page';
import {HomePageModule} from "../home/home.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LoginRegisterPageRoutingModule,
        HomePageModule
    ],
  declarations: [LoginRegisterPage]
})
export class LoginRegisterPageModule {}
