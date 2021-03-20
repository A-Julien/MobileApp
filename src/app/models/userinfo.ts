import {DocumentData, QueryDocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';

export class UserInfo {

    id: string;

    isNew: boolean;
    userUid: string;
    categories: string[];

    constructor(userUid: string) {
        this.isNew = false;
        this.userUid = userUid;
        this.categories = [];
        this.categories.push('All');
    }
}

export const uInfoToFirebase = {
    toFirestore(uInfo: UserInfo): DocumentData {
        return {
            isNew: uInfo.isNew,
            userUid: uInfo.userUid,
            categories: uInfo.categories
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot<UserInfo>,
        options: SnapshotOptions
    ): UserInfo {
        const data = snapshot.data(options);
        const id = snapshot.id;

        return {id, ...data};
    }
};
