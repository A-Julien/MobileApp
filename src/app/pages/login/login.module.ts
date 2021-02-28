import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import {ShowHidePasswordPageModule} from '../show-hide-password/show-hide-password.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LoginPageRoutingModule,
        ReactiveFormsModule,
        ShowHidePasswordPageModule
    ],
    declarations: [LoginPage]
})
export class LoginPageModule {}
