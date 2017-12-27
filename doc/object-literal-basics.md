# Object Literal Basics

Object literal is the simplest way of creating an object. Still, it's already sufficiently rich for object-oriented programming. Let's explore some of its basics:

- [Object nature](#Object-nature)
- [Object literal syntax](#Object-literal-syntax)
- [JSON](#JSON)
- [Property names](#Property-names)
- [ECMAScript 2015](#ECMAScript-2015)
- [Accessors](#Accessors)
- [TypeScript `readonly` keyword](#typescript-readonly-keyword)

## Object nature

A JavaScript object is roughly a container for named values, a dictionary/map from strings (name/key) to values. The object entries, the `name: value` pairs, are called properties. The value can be any JavaScript value, including a function. A property having a function as value is called a method like in C#, Java...

There are two kinds of special properties:

- Accessors: getters and setters
- Internal properties: used by JavaScript engines but not directly accessibles ; named within double brackets, like `[[Prototype]]` aka [`__proto__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto) which is by the way pronounced [“dunder proto”](http://2ality.com/2012/10/dunder.html), “dunder” being the contraction of double underscore, and that is accessible using [`Object.getPrototypeOf()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf).

## Object literal syntax

The object literal syntax a.k.a. [initializer notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer) provides a handy and simple way to create a plain object in JavaScript (an instance of `Object`): name-value pairs separated by a comma and enclosed inside curly braces: `{ color: 'green', message: 'hello' }`.

> “The ability to directly create objects is one of JavaScript’s standout features: you can start with concrete objects (no classes needed!) and introduce abstractions later.” _~ Dr. Axel Rauschmayer in his book [Speaking JavaScript](http://speakingjs.com/es5/ch17.html#object_literals)_

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
- square bracket / `Array`-like notation in any case, with the property name:
  - enclosed in quotes (`o['b']`), even with a name declared without quotes (`o['a']`), even for a name declared with a number (`o['3']`).
  - without quotes for a name declared with a number, like a real `Array` (`o[3]`).

|                  | dot notation | bracket notation with string | bracket notation with number |
|------------------|:------------:|:----------------------------:|:----------------------------:|
| valid identifier |      ok      |              ok              |               KO             |
| string           |      KO      |              ok              |               KO             |
| number           |      KO      |              ok              |               ok             |

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
