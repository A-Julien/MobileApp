import {Injectable, NgModule} from '@angular/core';
import {BrowserModule, HammerGestureConfig, HammerModule} from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CreateListComponent } from './modals/create-list/create-list.component';
import { CreateTodoComponent } from './modals/create-todo/create-todo.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AngularFireModule} from '@angular/fire';
import { AngularFireAnalyticsModule} from '@angular/fire/analytics';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { AngularCropperjsModule } from 'angular-cropperjs';
import {SideMenuComponent} from './modals/side-menu/side-menu.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import {EmailComposer} from '@ionic-native/email-composer/ngx';
import {LocationStrategy, PathLocationStrategy} from '@angular/common';
import 'hammerjs';
import {RmCatComponent} from './popOvers/rm-cat/rm-cat.component';
import { pageTransition } from './transitions/page-transition';

@Injectable()
export class HammerConfig extends HammerGestureConfig {
    overrides = {
        pinch: { enable: false },
        rotate: { enable: false }
    } as any;
}

@NgModule({
    declarations: [
        AppComponent,
        CreateListComponent,
        CreateTodoComponent,
        SideMenuComponent,
        RmCatComponent
    ],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot({ navAnimation: pageTransition }),
        AppRoutingModule,
        ReactiveFormsModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule.enablePersistence(),
        AngularFireAnalyticsModule,
        AngularFirestoreModule,
        HttpClientModule,
        AngularCropperjsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
        FormsModule,
        HammerModule
    ],
    providers: [
        StatusBar,
        EmailComposer,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: LocationStrategy, useClass: PathLocationStrategy}
        ],
    exports: [
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
