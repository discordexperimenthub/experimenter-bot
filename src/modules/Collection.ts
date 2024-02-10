export default class Collection<key, value> extends Map<key, value> {
    map(callback: (value: value, key: key, map: this) => unknown): unknown[] {
        const array: unknown[] = [];

        for (let [key, value] of this) {
            array.push(callback(value, key, this));
        };

        return array;
    };
};