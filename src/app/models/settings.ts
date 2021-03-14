import {DocumentData, QueryDocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';

export class USettings {

    id: string;
    userUid: string;

    forceOfflineOcr: boolean;

    constructor(userUid: string) {
        this.userUid = userUid;
        this.forceOfflineOcr = false;

    }
}
export const USettingsToFirebase = {
    toFirestore(us: USettings): DocumentData {
        return {
            userUid: us.userUid,
            forceOfflineOcr: us.forceOfflineOcr
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot<USettings>,
        options: SnapshotOptions
    ): USettings {
        const data = snapshot.data(options);
        const id = snapshot.id;

        return {id, ...data};
    }
};
