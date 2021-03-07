import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ListService} from '../../services/list.service';
import {ModalController} from '@ionic/angular';
import {Todo} from '../../models/todo';

@Component({
  selector: 'app-create-todo',
  templateUrl: './create-todo.component.html',
  styleUrls: ['./create-todo.component.scss'],
})
export class CreateTodoComponent implements OnInit {

  @Input() listId: string;

  public newTodoForm: FormGroup;

  constructor(private listService: ListService, private formBuilder: FormBuilder, private modalController: ModalController) { }

  ngOnInit(){
    this.newTodoForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.maxLength(255)]],
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  createNewTodo(){
    if (this.newTodoForm.valid){
      this.listService.creatTodo(new Todo(this.newTodoForm.get('name').value, this.newTodoForm.get('description').value) , this.listId);
      this.dismissModal();
    }
  }

  get errorControl() {
    return this.newTodoForm.controls;
  }

}
