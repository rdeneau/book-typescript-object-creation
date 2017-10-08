class AOk {
    constructor(id) {
        this.id = id;
    }
}

class AKo {
    constructor(id) {
        this.id = id;
        return { msg: 'hello' }; // Instead of `this`
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

checkClassA(AKo);
// Assertion failed: Unexpected id: undefined != 1
// Assertion failed: Unexpected __proto__: [object Object] != [object Object]
// {msg: "hello"}