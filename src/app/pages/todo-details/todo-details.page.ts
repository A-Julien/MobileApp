import {Component, Input, OnInit} from '@angular/core';
import {Todo} from '../../models/todo';
import {ActivatedRoute} from '@angular/router';
import {ListService} from '../../services/list.service';

@Component({
  selector: 'app-todo-details',
  templateUrl: './todo-details.page.html',
  styleUrls: ['./todo-details.page.scss'],
})
export class TodoDetailsPage implements OnInit {

  public todo: Todo;

  constructor(private route: ActivatedRoute, private listService: ListService) { }

  ngOnInit() {
    const todoId = this.route.snapshot.paramMap.get('todoId');
    const listId = this.route.snapshot.paramMap.get('listId');
    this.todo = this.listService.getOne(listId).todosList.find(todo => todo.id === todoId);
  }

}
