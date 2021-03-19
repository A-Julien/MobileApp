import {DocumentData, QueryDocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';

export class UserInfo {

    id: string;

    isNew: boolean;
    userUid: string;

    constructor(userUid: string) {
        this.isNew = false;
        this.userUid = userUid;
    }
}

export const uInfoToFirebase = {
    toFirestore(uInfo: UserInfo): DocumentData {
        return {
            isNew: uInfo.isNew,
            userUid: uInfo.userUid,
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
