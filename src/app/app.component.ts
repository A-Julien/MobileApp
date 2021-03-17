import { Component } from '@angular/core';

import {Platform, PopoverController} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {registerWebPlugin} from '@capacitor/core';
import {FacebookLogin} from '@capacitor-community/facebook-login';

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
        private popoverControler: PopoverController
    ) {
        registerWebPlugin(FacebookLogin);
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }

    closed() {
        this.popoverControler.dismiss();
    }
}
