import firebase from 'firebase';
import {DocumentData, QueryDocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {Todo} from './todo';

export enum ListType {
    note = '0',
    todo = '1'
}

export class List {
    id: string;
    name: string;
    todos: Todo[];

    category: string;

    owner: string;
    share: boolean;
    owners: string[];

    type: ListType;

    isChecked = false;

    constructor(name: string, type: ListType, category: string) {
        this.isChecked = false;
        this.name = name;
        this.todos = [];
        this.owners = [];
        this.share = false;
        this.type = type;
        this.category = category;
    }
}

export const listToFirebase = {
    toFirestore(list: List): DocumentData {
        return {
            name: list.name,
            owner: list.owner,
            type: list.type,
            share: list.share,
            owners: list.owners,
            category: list.category
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

export class Checker {
    id: string;
    isChecked = false;


    constructor(id: string) {
        this.id = id;
    }
}

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

