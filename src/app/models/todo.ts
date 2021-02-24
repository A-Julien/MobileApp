export class Todo {

    id: string;
    name: string;
    content: string;
    isDone: boolean;

    constructor(name: string, content: string) {
        this.name = name;
        this.content = content;
        this.id = Math.random().toString(36).substr(2, 9);
        this.isDone = false;
    }
}
