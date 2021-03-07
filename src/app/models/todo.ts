import {DocumentData, QueryDocumentSnapshot, SnapshotOptions} from "@angular/fire/firestore";
import {List} from "./list";

export class Todo {

    id: string;
    name: string;
    content: string;
    isDone: boolean;

    constructor(name: string, content: string) {
        this.name = name;
        this.content = content;
        this.isDone = false;
    }
}
export const todoToFirebase = {
    toFirestore(todo: Todo): DocumentData {
        return {
            name: todo.name,
            content: todo.content,
            isDone: todo.isDone
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot<Todo>,
        options: SnapshotOptions
    ): Todo {
        const data = snapshot.data(options);
        const id = snapshot.id;

        return {id, ...data};
    }
};
