import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowHidePasswordPageRoutingModule } from './show-hide-password-routing.module';

import { ShowHidePasswordPage } from './show-hide-password.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ShowHidePasswordPageRoutingModule
    ],
    exports: [
        ShowHidePasswordPage
    ],
    declarations: [ShowHidePasswordPage]
})
export class ShowHidePasswordPageModule {}
