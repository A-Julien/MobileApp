import firebase from 'firebase';
import {DocumentData, QueryDocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {Todo} from './todo';

export class List {
    id: string;
    name: string;
    todos: Todo[];

    owner: string;
    share: boolean;
    owners: string[];

    isChecked = false;

    constructor(name: string) {
        this.isChecked = false;
        this.name = name;
        this.todos = [];
        this.owners = [];
        this.share = false;
    }
}

export const listToFirebase = {
    toFirestore(list: List): DocumentData {
        return {
            name: list.name,
            owner: list.owner,
            share: list.share,
            owners: list.owners
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot<List>,
        options: SnapshotOptions
    ): List {
        const data = snapshot.data(options);
        const id = snapshot.id;

        return {id, ...data};
    }
};

export const toFirebaseExtended = {
    toFirestore(list: List): DocumentData {
        return {
            name: list.name,
            owner: list.owner,
            share: list.share,
            owners: list.owners,
            todos: list.todos
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot<List>,
        options: SnapshotOptions
    ): List {
        const data = snapshot.data(options);
        const id = snapshot.id;

        return {id, ...data};
    }
};

