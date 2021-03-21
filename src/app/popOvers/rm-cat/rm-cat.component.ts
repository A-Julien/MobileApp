import { Component, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-rm-cat',
  templateUrl: './rm-cat.component.html',
  styleUrls: ['./rm-cat.component.scss'],
})
export class RmCatComponent implements OnInit {

  constructor(
      private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {}

  async dismissPopover(action: number) {
    await this.popoverCtrl.dismiss(action, '', 'rmCat');
  }
}
