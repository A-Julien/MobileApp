
export class USettings {

    id: string;

    userUid: string;
    forceOfflineOcr: boolean;

    constructor(jsonStr: string) {
        if (jsonStr.length <= 1) { return; }
        const jsonObj: any = JSON.parse(jsonStr);
        for (const prop in jsonObj) {
            this[prop] = jsonObj[prop];
        }
    }
}
