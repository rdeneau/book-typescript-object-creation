# JavaScript Object Creation - Immutability

![Stained glass, Holy Family Church, Teconnaught](img/immutable.jpg)
_(Credit: [By Tahc (Own work), via Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Stained_glass,_Holy_Family_Church,_Teconnaught,_September_2010_crop.jpg))_

> ⚠️ Work in progress! 🚧

<!--
TODO:
- https://vsavkin.com/immutability-vs-encapsulation-90549ab74487

-->

[Immutability](https://en.wikipedia.org/wiki/Immutable_object) is an interesting concept that is correlated to object creation. It's been spotlighted in the JavaScript ecosystem by libraries like [Redux](http://redux.js.org) that rely on it to achieve both high performance in change detection (made by reference) and separation of concerns splitting states (immutable) and actions (producing new states), enabling a [functional programming](https://en.wikipedia.org/wiki/Functional_programming) style.

> _For further information, see [Redux FAQ: Immutable Data](http://redux.js.org/docs/faq/ImmutableData.html)._

Indeed, Immutability is one of the two pillars of functional programming, along with functions as [first class citizens](https://en.wikipedia.org/wiki/First-class_citizen). In JavaScript, only this last condition is true in the language core. 

It's still possible to write code that never mutates an object. Indeed, it's a good practice that can improve the code by reducing side effects. But it's better if immutability is handled in the language itself. Let's see some ways to get closed to immutability in JavaScript.

## `const` keyword

Don't get confused with `const` ES6 keyword. In the following statement `const a = value;`, it does indicate that something is ‘constant’, immutable, but it's the reference, the address of the variable in the memory, the binding of the variable to the value that is immutable, not the variable itself. Trying to reassign a constant variable or applying an [assignment operator](https://tc39.github.io/ecma262/#sec-assignment-operators) on it will throw a `TypeError: Assignment to constant variable.`.

The confusion may come when the value is a primitive type (`boolean`, `number`, `string`, `Symbol`, `undefined`, `null`)  a.k.a. a value type (as opposed to reference types: `Date`, `Object`, ...) because they are immutable: any operation made to change the value will be ignored (ex#1) or will produce a new reference (ex#2), so will be prevented by the `const` keyword.

```js
// #1
const foo = 27;
foo.bar = 42; // → No error, even in strict mode.
console.log(foo, foo.bar); // → `27 undefined`
foo++; // → TypeError: Assignment to constant variable.

// #2
let bar = 42;
let baz = bar; // → `baz` is bound to the same value as `bar`.
bar++; // → New reference bound to bar.
console.log(bar, baz); // → `43 42`
```

But a constant object remains mutable. It's a valid operation to change any of its writable properties:

```js
const foo = {}, bar = foo;
foo = { baz: 42 }; // → TypeError: Assignment to constant variable.
foo.baz = 42; // → No error.
Object.assign(foo, { baz: 42 }); // → No error.
console.log('foo=', foo, 'bar=', bar); // → `foo= {baz: 42} bar= {baz: 42}`
```

This is not to say that `const` is useless. On the contrary, writing ES6+/TypeScript code, it's a good habit to favor `const` over `let`. When declaring a variable, starts using `const` and turns it into `let` if necessary. Use `var` in very special cases, for instance when a variable can be (re)declared and extended in several files, like a [TypeScript `namespace`](http://www.typescriptlang.org/play/#src=namespace%20Foo%20%7B%0D%0A%20%20%20%20export%20const%20bar%20%3D%205%3B%0D%0A%7D). And finally never declare a variable without any of these keywords to avoid evil global variables and bugs really hard to find.

## `Object.create()`

Using its optional parameter `propertiesObject`, ECMAScript 5.1 [`Object.create(proto[, propertiesObject])`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create) seems to offer a way to create immutable objects. There are 2 options but in fact none are satifying.

### Not writable

The first option is to use the `writable: false` descriptor. The corresponding property will be readonly: any assignment to it will be ignored. The issue is that even in strict mode no error is thrown:

_`object.create_1_prop-not-writable.js`_

```js
"use strict";
const mathConstants = Object.create({}, { pi: { value: 3.1416, enumerable: true, writable: false } }); // [ts] Type `any`!
mathConstants.pi = 5; // No error, even in strict mode!
console.log(mathConstants); // → {pi: 3.1416}
```

### Get only

Another option is to create a "get only" property, i.e. only with the `get` descriptor and without the `set` descriptor. This way, any attempt to assign a new value will throw an error in strict mode (but still silently fail in regular mode). But the output object is not well printed in the console:

_`object.create_2_prop-get-only.js`_

```js
"use strict";
const mathConstants = Object.create({}, { pi: { get: () => 3.1416, enumerable: true } }); // [ts] Type `any`!
console.log(mathConstants); // → (Chrome) {}
                            // → (Node) { pi: [Getter] }
mathConstants.pi = 5; // Uncaught TypeError: Cannot set property pi of #<Object> which has only a getter
```

In fact, if this solution suit you, it's simpler to create this object directly as a literal :

_`object-literal_prop-get-only`_

```js
"use strict";
const mathConstants = { get pi() { return 3.1416; } }; // [ts] { readonly pi: number; }
console.log(mathConstants); // → (Chrome) {}
                            // → (Node) { pi: [Getter] }
mathConstants.pi = 5; // Uncaught TypeError: Cannot set property pi of #<Object> which has only a getter
```

### TypeScript

Another issue comes from the TypeScript compiler that does not handle this syntax: in both cases, the resulting object is seen with a type `any`! It only works with the literal object.

## `Object.seal()` and `Object.freeze()`

These ES5.1 functions are interesting regarding immutability but none of them are sufficient.

[`Object.seal()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) prevents new properties from being added to an object and marks all existing properties as non-configurable hence not removable. But their values can still be changed as long as they are writable.

[`Object.freeze()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) goes further, preventing the value, the enumerability, the configurability and the writability of existing properties from being changed. Hence, the descriptors of these properties are turned into `configurable: false, writable: false`.

**Limitations**:

- TODO: test assignment → silent fail or error in strict mode
- It's is shallow freeze: nested objects within a frozen object can still be mutated. To perform a deep freeze and achieve full immutability, we can used a `deepFreeze()` function as the one provided in [the examples of the MDN entry on Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#Examples).
- `Object.freeze()` only works on property-value pairs. There is currently no way to make other objects such as `Date`, ES6 [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) or ES6 [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) fully immutable.

## `readonly` properties

TypeScript offers another interesting keyword regarding immutability implementation: `readonly`. This property modifier has a similar effect on properties to what `const` does with variables. It has the same limitation on nested objects, but now, every properties of nested objects can be marked as readonly too and, voilà, we've got all types immutable.

It ressembles the [`readonly` C# keyword](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/readonly) but with more flexibility. In C#, readonly field must be initialized either with their definition or within the constructor(s). TypeScript offers a third coding style: declaring fields directly in the constructor of a class:

```ts
class Foo {
    constructor(public readonly bar: number) { }
}
```

But be careful: `readonly` is only declarative and is simply removed from the compiled JavaScript without any transpilation. So it's not enough to guarantee the immutability at run-time. If you need immutability at run-time, for instance for a library written in TypeScript and consumed in JavaScript code, you can't rely on `readonly` to do the job.

This is where `Object.freeze()` can be useful. And TypeScript handles it perfectly, using the mapped types `Readonly<T>` and `ReadonlyArray<T>`:

```ts
const o = Object.freeze({ foo: 1 }); // → Typed `Readonly<{ foo: number }>`
const a = Object.freeze([1, 2]); // → Typed `ReadonlyArray<number>`
```

Another possibility is to use a `@frozen` on immutable classes and a `@readonly` on `readonly` properties, which can be made using respectively `Object.freeze(foo)` and `Object.defineProperty(foo, 'bar', { ...Object.getOwnPropertyDescriptor(foo, 'bar'), configurable: false, writable: false })`.

Further information:

- [TypeScript 2.1: Mapped Types | Marius Schulz, Jan 2017](https://blog.mariusschulz.com/2017/01/20/typescript-2-1-mapped-types)
- [Exploring EcmaScript Decorators | Addy Osmani, Jul 2015](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841)

## Getters and private fields

TypeScript...
todo

private TS keyword = simpler and better design than with ES6 Symbols (ref needed).

## External libraries

TODO: Immutable.JS

## Conclusion

TODO

## References

[Object Creation in JavaScript | FunFunFunction](https://www.youtube.com/watch?v=GhbhD1HR5vk&index=1&list=PL0zVEGEvSaeHBZFy6Q8731rcwk0Gtuxub)

[Understanding and Embracing TypeScript’s “readonly”](https://spin.atomicobject.com/2017/08/14/typescript-readonly-intro/)
