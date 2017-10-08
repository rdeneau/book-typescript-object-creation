# Object Literal

## Introduction

A JavaScript object is roughly a container for named values, a dictionary/map from strings (name/key) to values. The object entries, the `name: value` pairs, are called properties. The value can be any JavaScript value, including a function. A property having a function as value is called a method like in C#, Java...

There are two kinds of special properties:

- Accessors: getters and setters
- Internal properties: used by JavaScript engines but not directly accessibles ; named within double brackets, like `[[Prototype]]` aka [`__proto__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto) which is by the way pronounced [“dunder proto”](http://2ality.com/2012/10/dunder.html), “dunder” being the contraction of double underscore, and that is accessible using [`Object.getPrototypeOf()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf).

The object literal syntax a.k.a. [initializer notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer) provides a handy and simple way to create a plain object in JavaScript (an instance of `Object`): name-value pairs separated by a comma and enclosed inside curly braces: `{ color: 'green', message: 'hello' }`.

> _“The ability to directly create objects is one of JavaScript’s standout features: you can start with concrete objects (no classes needed!) and introduce abstractions later.” ~ Dr. Axel Rauschmayer in his book [Speaking JavaScript](http://speakingjs.com/es5/ch17.html#object_literals)_

To avoid an object literal at the beginning of a statement to be interpreted as the beginning of a block `{...}`, it can be enclosed in parentheses `({ a: 1 })`. It's often the case with fat-arrow function:

```ts
const keyValueFactory = <T>(key: string, value: T) => ({ key, value });
const foo = keyValueFactory('foo', 5); // → {key: "foo", value: 5}
```

## JSON

An object literal is human readable and pretty compact, at least more than XML, which leads to have created **[JSON](http://json.org/)** (JavaScript Object Notation) as an alternative text format for structured data interchange. It was originally specified by Douglas Crockford, the famous author of [JavaScript: The Good Parts](http://shop.oreilly.com/product/9780596517748.do) in 2008 in which he restored JavaScript as a great language, aside from its bad parts and far from its current toy language reputation.

In fact, JavaScript object literal syntax differs from JSON in being more flexible:

- **name** in JSON must be a string hence between double quotes whereas object literal syntax also supports any valid variable name.
- `Date` type is not supported in JSON; string must be used instead.
- JavaScript object literals can contains **functions**, their methods.
- JavaScript supports [trailing commas](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Trailing_commas) since ES5 and ignores them. _However, the best practice is to avoid trailing commas in object literals, to enforce clarity and to be compatible with older browser versions._

## Property names

Property names can be:

- A valid JavaScript [identifier](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Variables): it's the common usage.
- A string, including the empty string: it's useful when copying from a JSON object ; other usages may be suspicious: for a key/value collection, prefer the ES6 [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object.
- A number: this leaves the door open to all sort of quirks, like the `Array`-like [`arguments` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments).

Considering the object `o = { a: 'a', 'b': 'b', 3: 'c' }`, its properties can be accessed using:
- dot notation when the property name is a valid identifier (`o.a`), even with a name declared in quotes (`o.b`),
- square braket / `Array`-like notation in any case, with the property name:
  - enclosed in quotes (`o['b']`), even with a name declared without quotes (`o['a']`), even for a name declared with a number (`o['3']`).
  - without quotes for a name declared with a number, like a real `Array` (`o[3]`).

|                  | dot notation | braket notation with string | braket notation with number |
|------------------|:------------:|:---------------------------:|:---------------------------:|
| valid identifier |      ok      |              ok             |              KO             |
| string           |      KO      |              ok             |              KO             |
| number           |      KO      |              ok             |              ok             |

## ECMAScript 2015

The object literal notation has been extended with ECMAScript 2015 (ES2015 aka ES6), with enhancements regarding compactness.

- **Shorthand property names**, using variable names: `{ a: a, b: b }` can be written `{ a, b }`.
- **Shorthand method names**, omitting the `: function` part: `{ do: function(args) {...} }` can be shortened `{ do(args) {...} }`.
- **Computed property names**, using an expression inside brackets: `{ ['Prop' + i]: i }`. In case of duplicated names, no error is thrown and the object stores the last value.

## Accessors

The terminology is different between C# and JavaScript. In JavaScript, the term _property_ encompasses different object parts in C#: _field_, _method_ and _property_. So, the equivalent of a C# property is a JS property defined through accessor(s), a getter and/or a setter. There's no equivalent in Java where the expression "getter and setter" refers to the couple of methods `T getXxx()` / `void setXxx(T x)`.

The standard and safer use of accessor is to allow the encapsulation of an internal variable:

```ts
function fooFactory(name: string, value: number) {
  return {
    get name() {
      return name;
    },
    get value() {
      return value;
    },
    set value(val: number) {
      value = val;
    }
  };
}

const foo = fooFactory('foo', 1); // [Ts] const foo: { readonly name: string; value: number; }
foo.value++; // → foo == { name: 'foo', value: 2 }
```

A getter can also be used to return a dynamically computed value. Hence, it acts as an alternative to a query method without parameters, simplifying calls from the consumer side (`o.getProp()` → `o.prop`). But sometimes a method can express more explicitly the computation/dynamic aspect behind the scene, through its name containing a verb, an action, and the function call syntax: `computeProp()`. It's even more true for "long" computation i.e. not immediate. Likewise, defining a setter only property can be confusing. In general, a command method convey more meaning and is better to reveal its intent.

## TypeScript `readonly` keyword

In the previous example, note the TypeScript inferred type for the `foo` variable: it's marked with a `readonly` meaning that the `name` property can't be set. We can achieve the same behaviour with a type assertion instead of the getter-only, but only at the TypeScript level, not at run-time:

```ts
interface Counter {
  readonly value: number;
}

function counterFactory(value: number): Counter {
  return { value };
}

const foo = counterFactory(0);
foo.value = 2; // [Ts Error] Can not assign to 'value' because it is a constant or read-only property
Object.assign(foo, { value: 2 }); // No error → foo = { value: 2 }
```

With a real read-only property i.e. a get-only property, the `Object.assign()` call will fail with a `TypeError: Cannot set property value of #<Object> which has only a getter`.

An extension of the `readonly` keyword is the TypeScript 2.1 `Readonly<T>` mapped type, used to express the result of the `Object.freeze()` function: all properties of the input object become readonly.

_Warning_: don't assume that a get-only / read-only property always returns the same value, a kind of constant. Even without a public setter, the value can change internally:

```ts
function counterFactory(value: number) {
  return {
    get value() {
      return value;
    },
    inc() {
      return ++value;
    }
  };
}

const foo = counterFactory(1); // [Ts] const foo: { readonly value: number; inc(): number; }
foo.inc(); // → foo.value = 2
```

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

### Why?

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

### Function overloads

Since JavaScript doesn't allow function overloads, it's a common pattern to handle the arguments variation by number or by type directly in the function body. A well-known example is the [jQuery `$()` global function](http://api.jquery.com/jQuery/). In addition to previous typings, to avoid huge union types to define all possible argument types, TypeScript allows the definition of a set of more precise function signatures called [overloads](http://www.typescriptlang.org/docs/handbook/functions.html#overloads). From the function consumer side, it's more convenient.

More details in [Function Overloads in TypeScript, by Marius Schulz, Aug 2016].

Little warning: make sure of listing all the overloads and then write the main function. The TypeScript FAQ mentions the case of the last signature missing, mixed with the main function: see the question ["Why am I getting Supplied parameters do not match any signature error?"](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-am-i-getting-supplied-parameters-do-not-match-any-signature-error).

### Adding or removing a property

TODO

--

TODO: ne pas confondre avec les interfaces
Object destructuring: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-cant-i-use-x-in-the-destructuring-function-f-x-number------ 

--

TODO: articles à continuer à lire:
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects
- https://medium.com/javascript-scene/javascript-factory-functions-with-es6-4d224591a8b1
