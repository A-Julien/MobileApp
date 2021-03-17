import { Component, OnInit } from '@angular/core';
import {ListService} from '../../services/list.service';
import {Observable} from 'rxjs';
import {MetaList} from '../../models/metaList';
import {Router} from '@angular/router';
import {MenuController, PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-share-history',
  templateUrl: './share-history.component.html',
  styleUrls: ['./share-history.component.scss'],
})
export class ShareHistoryComponent implements OnInit {

  listsShared: Observable<MetaList[]>;

  constructor(
      private listService: ListService,
      private router: Router,
      public popOverCtrl: PopoverController,
      public menuController: MenuController,
  ) { }

  ngOnInit() {
    this.listsShared = this.listService.listShare;
  }

  close() {
    this.popOverCtrl.dismiss();
  }


  routeToTodos(listID: string) {
    this.close();
    this.menuController.close();
    this.router.navigate(['/list-details/' + listID]);
  }
}
