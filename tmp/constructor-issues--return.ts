class AOk {
    constructor(public readonly id: number) { }
}

class AKoTs {
    constructor(public readonly id: number) {
        return { msg: 'hello' }; // [ts error] Type '{ msg: string;}' is not assignable to type 'AKoTs'... 'msg' does not exist in type 'AKoTs'.
    }
}

class AKoJs {
    constructor(public readonly id: number) {
        return { id: -99 }; // Instead of this
    }
}

function isEqual(x, y, label) {
    console.assert(x === y, `Unexpected ${label}: ${x} != ${y}`);
}

function checkClassA(A) {
    const id = 1;
    const a = new A(id);
    isEqual(a.id, id, 'id');
    isEqual(Object.getPrototypeOf(a), A.prototype, '__proto__');
    return a;
}

checkClassA(AOk);
// AOk {id: 1}

checkClassA(AKoJs);
// Assertion failed: Unexpected id: -99 != 1
// Assertion failed: Unexpected __proto__: [object Object] != [object Object]
// {id: -99}