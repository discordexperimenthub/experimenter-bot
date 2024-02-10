import { existsSync, readFileSync, writeFileSync } from "fs";

export default class Database {
    filePath: string;
    data: any;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.data = {};

        if (existsSync(filePath)) {
            let fileData = readFileSync(filePath, 'utf8');

            this.data = JSON.parse(fileData);
        };
    };

    save(): void {
        let jsonData = JSON.stringify(this.data, null, 2);

        writeFileSync(this.filePath, jsonData, 'utf8');
    };

    get(key: string): any {
        let keys = key.split('.');
        let nestedObj = this.data;

        for (let k of keys) {
            if (!nestedObj[k]) return undefined;

            nestedObj = nestedObj[k];
        };

        return nestedObj;
    };

    set(key: string, value: any): void {
        let keys = key.split('.');
        let lastKey = keys.pop();
        let nestedObj = this.data;

        for (let k of keys) {
            if (!nestedObj[k]) nestedObj[k] = {};

            nestedObj = nestedObj[k];
        };

        nestedObj[lastKey] = value;

        this.save();
    };

    delete(key: string): void {
        let keys = key.split('.');
        let lastKey = keys.pop();
        let nestedObj = this.data;

        for (let k of keys) {
            if (!nestedObj[k]) return;

            nestedObj = nestedObj[k];
        };

        delete nestedObj[lastKey];

        this.save();
    };

    clear(): void {
        this.data = {};

        this.save();
    };

    has(key: string): boolean {
        return this.get(key) !== undefined;
    };

    push(key: string, value: any): any {
        let array = this.get(key) || [];

        array.push(value);
        this.set(key, array);
    };
};