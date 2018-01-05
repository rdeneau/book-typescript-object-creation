# Object Literal Advanced Features

> ⚠️ **Work in progress**

<!--

Object destructuring: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-cant-i-use-x-in-the-destructuring-function-f-x-number------ 

--

TODO: articles à continuer à lire:
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects
- https://medium.com/javascript-scene/javascript-factory-functions-with-es6-4d224591a8b1

-->

**Contents:**

<!-- TOC depthFrom:2 depthTo:3 -->

- [`this` keyword](#this-keyword)
    - [Rules](#rules)
    - [Why](#why)
- [Fat-arrow syntax](#fat-arrow-syntax)
- [Dynamic JavaScript and TypeScript typings](#dynamic-javascript-and-typescript-typings)
    - [Non existent property](#non-existent-property)
    - [Changing a property type](#changing-a-property-type)
- [Function overloads](#function-overloads)

<!-- /TOC -->

## `this` keyword

`this` can be used in methods to refer to the current object. But, unlike other object-oriented languages using the `this` keyword like Java and C#, it's not guaranteed. `this` is the _receiver_ of the method invocation. So, it depends on the context, on how the function is called and can be anything.

### Rules

There are the rules that set `this` inside a function being called:

1. `new` keyword (`new fn()`): `this` is the object being created.
2. [`apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply) (`fn.apply(o, args)`), [`call`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call) (`fn.call(o, arg1, ...)`), [`bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) (`fn.bind(o)(arg1, ...)`): `this` is the first argument of these functions.
3. Object method invocation (`o.fn()`, `o["fn"]()`): `this` is the object having this function as a property.
4. Free function invocation (`fn()`):
    - Not in [script mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode), `this` is the [global object](https://developer.mozilla.org/en-US/docs/Glossary/Global_object), `window` / [`self`](https://developer.mozilla.org/en-US/docs/Web/API/Window/self) inside a web browser.
    - In _strict mode_, if `this` was not defined by the execution context (see rule 3), it remains `undefined`.

If several rules apply, the rule with the lowest number wins and will set the `this` value. There is one exception to these rules, regarding _fat-arrow functions_ described below.

_More details in [The Complete Rules to 'this'](https://www.educative.io/collection/page/5679346740101120/5707702298738688/5676830073815040) and on the [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)._

### Why

`this` is an object-oriented concept. JavaScript incorporates also some functional programming aspects, inspired by [Scheme](https://en.wikipedia.org/wiki/Scheme_%28programming_language%29), including first-class functions. It enables us to copy a method into an outside variable, this copy being detached from its initial parent object. Hence, `this` inside the function does not point to its former parent object. The mixture of OOP and FP has led to these previous and a bit convoluted behaviors of `this`.

For a more detailed and funny explanations, I suggest you to watch the following _FunFunFunction_ episodes:

- [#43 - Object Creation in JavaScript Part 1 - `this` and `bind`](https://youtu.be/GhbhD1HR5vk)
- [#44 - Object Creation in JavaScript Part 2 - Examples of `this` and `bind`](https://youtu.be/PIkA60I0dKU).

## Fat-arrow syntax

A [`fat-arrow function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) can be used to write a method but not an accessor and they cannot be used as constructors. Moreover, using fat-arrow functions for methods is error prone because they don't bind theirs own `this`, [`arguments`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments), [`super`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super) or [`new.target`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target). 

```ts
const foo = {
  x: () => 2,
  get y: () => 2 // [Ts Error at char 7] '(' expected
};

const bar = {
  name: 'foo',                        // [Ts] (property) name: string
  greet: () => `Hello, ${this.name}!` // [Ts] (property) greet: () => any // (instead of string)
};
bar.greet(); // → 'Hello, !'
```

In fat-arrow functions, `this` retains the value of the enclosing lexical context's `this`. We can see it looking how TypeScript compiles a fat-arrow function into ES5 JavaScript capturing the value of `this` in the variable `_this`:

```ts
// TypeScript source
function fn() {
  return () => console.log(this);
}

// Resulting JavaScript
function fn() {
    var _this = this;
    return function () { return console.log(_this); };
}
```

## Dynamic JavaScript and TypeScript typings

The previous examples have given us a good insight of TypeScript type inference. Since JavaScript is a dynamic language, let's see how to handle objects in more dynamic situations in TypeScript.

### Non existent property

JavaScript was initially designed not to throw errors and to fail silently. Combining this behavior with its dynamic nature, we get:

1. Getting a property that doesn't exist returns `undefined`.
2. Assigning a value to a property that doesn't exist add the property to the object, even with the value `undefined`.
3. Invoking a method that doesn't exist throws an error.

In either cases, TypeScript indicates with a warning:

```ts
/**/  const o = {};
//TS        ^ [Info] const o: {}

/**/  // (1)
/**/  console.log(o.name); // → undefined
//TS                ~~~~ [Error] Property 'name' does not exist on type '{}'

/**/  // (2)
/**/  console.log(Object.keys(o)); // → []
/**/  o.name = undefined;
//TS    ~~~~ [Error] Property 'name' does not exist on type '{}'
/**/  console.log(Object.keys(o)); // → ["name"]

/**/  // (3)
/**/  o.do(); // → Uncaught TypeError: o.do is not a function
//TS    ~~ [Error] Property 'do' does not exist on type '{}'
```

TODO: any, interface, optional property, string map {[name: string]: any/T;}
TODO: define Property, obkect.assign → interface, type (non extendable)

### Changing a property type

If we try to assign to a property a value of a different type, TypeScript will emit a warning:

```ts
const o = { value: 1 };
o.value = ''; // [Ts Error] Type '""' is not assignable to type 'number'
```

The easy solution is to type the `value` property as `any` (A). But it's the TypeScript spirit. The proper way is to give a compound type of all acceptable types. These types are called [union types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types). Then, it can be done with an inline type assertion (B) but it's a bit insecure. It's safer not to use type assertion except in cases of force majeure! A safer approach is to use an inline / anonymous type for the whole object (C) or a named type i.e. an `interface` (D). Finally, we can define a type alias if needed, using the `type` keyword (E).

```ts
// (A) The poor-man solution using `any` 
const a = { value: 1 as any };
a.value = ''; // No error: OK
a.value = {}; // No error: no expected!

// (B) Inline union type with type assertion
const b = { value: 1 as number|string };
b.value = ''; // Still no error: OK
b.value = {}; // OK: [Ts Error] Type '{}' is not assignable to type 'string | number'
b.value = {} as string; // No error: no expected!

// (C) Inline/anonymous overall object type
const c: { value: number|string; } = { value: 1 };
c.value = ''; // Still no error: OK
c.value = {}; // OK: [Ts Error] Type '{}' is not assignable to type 'string | number'

// (D) Named type based on an interface
interface D {
  value: number|string;
}

const d: D = { value: 1 };
d.value = ''; // Still no error: OK
d.value = {}; // OK: [Ts Error] Type '{}' is not assignable to type 'string | number'

function changeValue(o: D, value: number|string) {
  o.value = value;
}

// (E) Type alias
type numberOrString = number | string;
interface E { value: numberOrString; }
const factory = (value: numberOrString): E => ({ value });
const e = factory(1);
e.value = '';
```

## Function overloads

Since JavaScript doesn't allow function overloads, it's a common pattern to handle the arguments variation by number or by type directly in the function body. A well-known example is the [jQuery `$()` global function](http://api.jquery.com/jQuery/). In addition to previous typings, to avoid huge union types to define all possible argument types, TypeScript allows the definition of a set of more precise function signatures called [overloads](http://www.typescriptlang.org/docs/handbook/functions.html#overloads). From the function consumer side, it's more convenient.

More details in [Function Overloads in TypeScript, by Marius Schulz, Aug 2016].

Little warning: make sure of listing all the overloads and then write the main function. The TypeScript FAQ mentions the case of the last signature missing, mixed with the main function: see the question ["Why am I getting Supplied parameters do not match any signature error?"](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-am-i-getting-supplied-parameters-do-not-match-any-signature-error).
