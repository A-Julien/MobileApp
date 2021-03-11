import { Component, OnInit } from '@angular/core';
import {ListService} from '../../services/list.service';
import {Observable} from 'rxjs';
import {MetaList} from '../../models/metaList';

@Component({
  selector: 'app-share-history',
  templateUrl: './share-history.component.html',
  styleUrls: ['./share-history.component.scss'],
})
export class ShareHistoryComponent implements OnInit {

  listsShared: Observable<MetaList[]>;

  constructor(private listService: ListService) { }

  ngOnInit() {
    this.listsShared = this.listService.getAllSharedListDB();
  }

}
