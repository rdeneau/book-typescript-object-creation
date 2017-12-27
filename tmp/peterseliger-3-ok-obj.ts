export interface ArrayLite<T> {
    [index: number]: T;
    readonly length: number;
}

export function applyArrayTrait<T, U extends ArrayLite<T>>(source: U) {
    const trait = {
        first: () => source[0],
        last: () => source[source.length - 1]
    };
    return Object.assign(source, trait); // typeof return = U & typeof trait
}

const list = applyArrayTrait(['foo', 'bar', 'baz']); // typeof list = string[] & { first: () => string; last: () => string; };
console.log('(typeof list.first)', typeof list.first); // "function"
console.log('(list.first())', list.first()); // "foo"
console.log('(list.last())', list.last()); // "baz"
