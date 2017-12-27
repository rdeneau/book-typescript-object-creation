abstract class LinqArrayTrait<T> extends Array<T> {
    static applyOn<T>(source: T[]) {
        LinqArrayTrait.apply(source);
        return source as LinqArrayTrait<T>;
    }

    first = function() {
        return this[0];
    };

    last() {
        return this[this.length - 1];
    }
}

const list = ['foo', 'bar', 'baz'] as any;
console.log('(typeof list.first)', typeof list.first); // "undefined"

let list2 = LinqArrayTrait.applyOn(list);
console.log('list.first()', list2.first()); // "foo"
