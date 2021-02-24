import {Todo} from './todo';

export class List {

    id: string;
    name: string;
    todosList: Todo[];

    constructor(name: string) {
        this.name = name;
        this.id = Math.random().toString(36).substr(2, 9);
        this.todosList = new Array<Todo>();
    }
}
