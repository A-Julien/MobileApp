import {DocumentData, QueryDocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
export class MetaList {

    id: string;
    newOwner: string;
    owner: string;
    listID: string;
    notify: boolean;

    constructor(newOwner: string, owner: string, listID: string) {
        this.newOwner = newOwner;
        this.owner = owner;
        this.listID = listID;
        this.notify = false;
    }
}
export const MetaListToFirebase = {
    toFirestore(metaList: MetaList): DocumentData {
        return {
            newOwner: metaList.newOwner,
            owner: metaList.owner,
            listID: metaList.listID,
            notify: metaList.notify
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot<MetaList>,
        options: SnapshotOptions
    ): MetaList {
        const data = snapshot.data(options);
        const id = snapshot.id;

        return {id, ...data};
    }
};
