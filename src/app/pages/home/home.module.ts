import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import {LoadingComponent} from '../../util/loading/loading.component';
import {ManageSharingComponent} from '../../modals/manage-sharing/manage-sharing.component';
import {AngularCropperjsModule} from 'angular-cropperjs';
import {CropImgComponent} from '../../modals/crop-img/crop-img.component';
import {ShareHistoryComponent} from '../../popOvers/share-history/share-history.component';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        HomePageRoutingModule,
        AngularCropperjsModule
    ],
  exports: [
    LoadingComponent
  ],
  declarations: [HomePage, LoadingComponent, ManageSharingComponent, CropImgComponent, ShareHistoryComponent]
})
export class HomePageModule {}
