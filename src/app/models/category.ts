import {DocumentData, QueryDocumentSnapshot, SnapshotOptions} from "@angular/fire/firestore";

export class Category {
    id: string;

    name: string;
    lists: string[];


    constructor(name: string) {
        this.name = name;
        this.lists = [];
    }
}

export const catToFirebase = {
    toFirestore(cat: Category): DocumentData {
        return {
            name: cat.name,
            lists: cat.lists
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot<Category>,
        options: SnapshotOptions
    ): Category {
        const data = snapshot.data(options);
        const id = snapshot.id;

        return {id, ...data};
    }
};
