import {Component, Input, OnInit} from '@angular/core';
import {Todo} from '../../models/todo';
import {ActivatedRoute} from '@angular/router';
import {ListService} from '../../services/list.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-todo-details',
  templateUrl: './todo-details.page.html',
  styleUrls: ['./todo-details.page.scss'],
})
export class TodoDetailsPage implements OnInit {

  public todo: Observable<Todo>;

  constructor(private route: ActivatedRoute, private listService: ListService) { }

  ngOnInit() {
    const todoId = this.route.snapshot.paramMap.get('todoId');
    const listId = this.route.snapshot.paramMap.get('listId');
    /*this.todo = this.listService.getOneDB(listId).pipe(
        map( data => {
          return data.todos.find(todo => todo.id === todoId);
        })
    );*/
    this.todo = this.listService.getOneTodo(listId, todoId);
    this.todo.subscribe(m => {console.log('INTODO', m); });
    /*this.todo = this.listService.getOneDB(listId).pipe(
      map(list => {
            return list.todos.find( todo => todo.id === todoId);
          }
      )
    );*/
  }

}
