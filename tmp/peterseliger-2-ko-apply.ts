export function ArrayTrait<T, U extends {
    [index: number]: T;
    readonly length: number;
}>(this: U) {
    const trait = {
        first: () => this[0],
        last: () => this[this.length - 1]
    };
    return Object.assign(this, trait); // T[] & { first: () => T; last: () => T; };
}

let list = ['foo', 'bar', 'baz'];
console.log('(typeof list.first)', typeof (list as any).first); // "undefined"
console.log('(typeof list.last)', typeof (list as any).last); // "undefined"

list = ArrayTrait.apply(list); // Bad type because apply returns any!
console.log('(typeof list.first)', typeof list.first); // "function"
console.log('(list.first())', list.first()); // "foo"
console.log('(list.last())', list.last()); // "baz"
