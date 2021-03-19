import { Component, OnInit } from '@angular/core';
import {PopoverController} from "@ionic/angular";

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {

  constructor(
      private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {}

 async dismissPopover(action: number) {
   await this.popoverCtrl.dismiss(action, '', 'options');
  }

}
