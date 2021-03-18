import { Component } from '@angular/core';

import {Platform, PopoverController} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {registerWebPlugin} from '@capacitor/core';
import {FacebookLogin} from '@capacitor-community/facebook-login';
import {MenuGuardService} from './services/menu-guard.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private popoverControler: PopoverController,
        private menuGuardService: MenuGuardService
    ) {
        this.initializeApp();
        registerWebPlugin(FacebookLogin);
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.menuGuardService.setMenuGuard();
        });
    }

    closed() {
        this.popoverControler.dismiss().catch(console.log);
    }
}
