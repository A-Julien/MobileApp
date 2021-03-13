import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CreateListComponent } from './modals/create-list/create-list.component';
import { CreateTodoComponent } from './modals/create-todo/create-todo.component';
import {ReactiveFormsModule} from '@angular/forms';
import {AngularFireModule} from '@angular/fire';
import { AngularFireAnalyticsModule} from '@angular/fire/analytics';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { AngularCropperjsModule } from 'angular-cropperjs';
import {SideMenuComponent} from './modals/side-menu/side-menu.component';

@NgModule({
  declarations: [AppComponent, CreateListComponent, CreateTodoComponent, SideMenuComponent],
  entryComponents: [],
  imports: [
      BrowserModule,
      IonicModule.forRoot(),
      AppRoutingModule,
      ReactiveFormsModule,
      AngularFireModule.initializeApp(environment.firebaseConfig),
      AngularFireAnalyticsModule,
      AngularFirestoreModule,
      HttpClientModule,
      AngularCropperjsModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
