import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import {LoadingComponent} from '../../util/loading/loading.component';
import {ManageSharingComponent} from '../../modals/manage-sharing/manage-sharing.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    HomePageRoutingModule
  ],
  exports: [
    LoadingComponent
  ],
  declarations: [HomePage, LoadingComponent, ManageSharingComponent]
})
export class HomePageModule {}
