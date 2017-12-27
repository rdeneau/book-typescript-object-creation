interface Trait<TSource, TTrait> {
    apply(_this: TSource): TSource & TTrait;
}

export interface ArrayLite<TItem> {
    [index: number]: TItem;
    readonly length: number;
}

export function ArrayTrait<TItem, TArray extends ArrayLite<TItem>>(this: TArray) {
    const trait = {
        first: () => this[0],
        last: () => this[this.length - 1]
    };

    function makeTrait() {
        return Object.assign(this, trait); // T[] & { first: () => T; last: () => T; };
    }
    return makeTrait() as Trait<TArray, typeof trait>;
}

let list = ['foo', 'bar', 'baz'];
console.log('(typeof list.first)', typeof (list as any).first); // "undefined"
console.log('(typeof list.last)', typeof (list as any).last); // "undefined"

list = ArrayTrait.apply(list); // Bad type because apply returns any!
console.log('(typeof list.first)', typeof list.first); // "function"
console.log('(list.first())', list.first()); // "foo"
console.log('(list.last())', list.last()); // "baz"
