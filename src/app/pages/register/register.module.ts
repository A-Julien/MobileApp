import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import {ShowHidePasswordPageModule} from "../show-hide-password/show-hide-password.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RegisterPageRoutingModule,
        ReactiveFormsModule,
        ShowHidePasswordPageModule
    ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}
