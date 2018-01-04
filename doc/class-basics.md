# Class

Classes have been introduced in ECMAScript 2015 (ES6) to offer a clean and Java-like syntax over the usual prototype-based construct. The purpose is the same: it's a structure to store an object type and to create objects instances of that type, with an initial state and some methods defined in the prototype.

Both the class and the instances can be modified at run-time, especially adding members, thus defining a new type. But classes are more appropriate for objects that don't change their type, thus to handle a static typed programming style. It suits well TypeScript and its type inference.

TypeScript goes further on class features, offering member visibility to handle encapsulation, read-only members, properties created within the constructor, class contract with interfaces.

<!-- TOC depthFrom:2 depthTo:2 -->

- [ES6 class](#es6-class)
- [TypeScript class](#typescript-class)
- [Property declarations](#property-declarations)
- [Function properties](#function-properties)
- [Nested classes](#nested-classes)
- [Class pitfalls and TypeScript safety net](#class-pitfalls-and-typescript-safety-net)
- [TypeScript interfaces](#typescript-interfaces)
- [TypeScript programming style](#typescript-programming-style)
- [TypeScript type tricks](#typescript-type-tricks)
- [Conclusion](#conclusion)

<!-- /TOC -->

## ES6 class

### Syntactical sugar

ES6 classes are syntactical sugar for both constructor function (defining properties) and prototype extension (defining methods). So the following class `Todo`:

```js
class Todo {
    constructor(name) {
        this.name = name || 'Untitled';
        this.done = false;
    }

    do() {
        this.done = true;
    }

    undo() {
        this.done = false;
    }
}
```

is equivalent to the usual constructor function `Todo`:

```js
var Todo = /** @class */ (function () {
    function Todo(name) {
        this.name = name || 'Untitled';
        this.done = false;
    }
    Todo.prototype.do = function () {
        this.done = true;
    };
    Todo.prototype.undo = function () {
        this.done = false;
    };
    return Todo;
}());
```

In fact, this is how TypeScript transpiled the `Todo` class to ES5. But this is not the exact equivalent because ES6 class methods are not _enumerable_:

```js
Object.getOwnPropertyDescriptor(Todo.prototype, 'do')
// → {value: ƒ, writable: true, enumerable: false, configurable: true}
```

The accurate equivalent of the first `Todo` class would be:

```js
var Todo = /** @class */ (function () {
    function Todo(name) {
        this.name = name || 'Untitled';
        this.done = false;
    }
    Object.defineProperties(Todo.prototype, {
        do: {
            value: function () {
                this.done = true;
            },
            writable: true,
            enumerable: false,
            configurable: true
        },
        undo: {
            value: function () {
                this.done = false;
            },
            writable: true,
            enumerable: false,
            configurable: true
        }
    });
    return Todo;
}());
```

### Properties

- **Strict mode**: as for inside an ES6 module, the class body is executed in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode).
- **Constructor**: the constructor is optional. As for functions that are not overridable, there can be only one constructor per class.
- **Name**: class declarations must provide unique names. Classes store their name in their [name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name) property. The class name can be retrieved from an instance through its `__proto__`: `Object.getPrototypeOf(new Todo()).constructor.name; // Todo`.
- **Hoisting**: class declarations are not [hoisted](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting) unlike function declarations. A class must be declared before and then accessed in the code that follows the class declaration.
- **Expression**: a class can also be defined in a [class expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/class).
- **Function**: except the non hoisting, a class is intrinsically a function. It's treated as a [first class citizen](https://en.wikipedia.org/wiki/First-class_citizen):
  - A class can be declared inside another function.
  - A class can be passed as argument to a function.
  - A class can be returned from a function.
  - The source code can be retrieved at runtime with `Todo.toString(); // "class Todo {...}"`.

### Static members

A class can have static members, besides its intrisic properties `name` and `prototype` (pushing aside the other obsolete function properties `arguments`, `caller` and `length`). Static members are marked with the `static` keyword.

Use case examples:

- Static factory methods like `Todo.create()`: this use case is even more useful in TypeScript with a private constructor, since its accessible from the static members of this class.
- Static constants, like instances for the [Singleton pattern](https://en.wikipedia.org/wiki/Singleton_pattern) or for the [State pattern](https://en.wikipedia.org/wiki/State_pattern) with a single class and immutable instances.

> **Warning**: `this` inside static members is `undefined` due to the strict mode.

## TypeScript class

TypeScript doesn't fully support constructor function: the type inference will fail. For instance, with the `Todo` function above, the inferred type of the variable `const todo = new Todo('');` is `any`!

In contrast, TypeScript fully supports ES6 class, proposing an enhanced syntax to simplify giving member types and to handle member encapsulation (`public` by default, `protected` or `private`) and life time (`readonly` to mimic a get-only property).

Direct translation in TypeScript of the previous `Todo` ES6 class needs additional types that cannot be inferred:

```ts
class Todo {
    done: boolean;
    name: string;

    constructor(name?: string) {
        this.name = name || 'Untitled';
        this.done = false;
    }

    do() {
        this.done = true;
    }

    undo() {
        this.done = false;
    }
}
```

The previous code, basically translated from ES6, can be simplified and enhanced:

- `done` can be initialized directly `done = false;`, the default value allowing to infere its `boolean` type.
- `name` property can be declared within the constructor, via the `public` keyword, with its default value also giving its `string` type. It can be marked as `readonly`, so that `public` can be omitted because its the implicit visibility in TypeScript.

```ts
class Todo {
    done = false;
    constructor(readonly name = 'Untitled') {}
    // [...]
}
```

We can go one step further, turning `Todo` objects immutable:

- `done` is readonly, defined within the constructor.
- Constructor is made private because `done` is false at the beginning and it's mutated via both methods `do()` and `undo()`.
- Creation is delegated to the static factory method `Todo.create()`.
- Default values are handled by this static constructor only, so that the arguments of the private constructor become compulsory.
- `do()` and `undo()` methods return new instances with the same name and the desired state.
- It ressembles now the [State Pattern](https://en.wikipedia.org/wiki/State_pattern).

```ts
class Todo {
    static create(name = 'Untitled') {
        return new Todo(name, false);
    }

    private constructor(
        readonly name: string,
        readonly done: boolean,
    ) {}

    do() {
        return new Todo(this.name, true);
    }

    undo() {
        return new Todo(this.name, false);
    }
}
```

## Property declarations

TypeScript enables to define properties outside and within the constructor, both features not available in ES6:

- Properties defined outside the constructor and only with their type: these are pure TypeScript definitions that are not transpiled to JavaScript.
- Properties defined outside the constructor and with a default value and optionaly with their type (if the type cannot be inferred or for the type everywhere coding style): these properties are transpiled into the constructor body.
- Properties defined within the constructor via arguments flagged with a visibility (`public`, `protected` or `private`) or with the `readonly` keyword, with or without default values, optional or not: these properties are also transpiled into the constructor body, with their the specified default values else `undefined`.

Example:

```ts
class Example {
    prop1?: number;
    prop2: number;
    prop3 = true;
    constructor(
        private prop4: string,
        public prop5?: any,
        private prop6 = 'prop6',
        otherArg = 'other'
    ) { }
}
const o = new Example('prop4');
// → { prop4: "prop4", prop5: undefined, prop6: "prop6", prop3: true }
```

Remarks:

- `prop1`: not in the object,
- `prop2`: the same, even if required in TypeScript (cf. no `?`)
- `prop3`: in the object, with the default value, but defined after the "constructor" properties,
- `prop4`: in the object, with the value specified as argument, even though `private` in TypeScript,
- `prop5`: in the object with the value `undefined`,
- `prop6`: in the object with the default value,
- `otherArg`: not in the object - just an argument of the function.

## Function properties

So the object properties are stored directly in the object, each instance having its own state, while the methods are stored in the class/constructor prototype i.e. in the object `__proto__`, all instances sharing the class behaviour.

An object can also have a _property which is a function_. We are in between state and behaviour. This a useful to split an algorithm into invariant versus variant parts. This kind of properties are conceptually similar to [Strategy](https://en.wikipedia.org/wiki/Strategy_pattern) classes reduced to only one function or a method of the [Template method pattern](https://en.wikipedia.org/wiki/Template_method_pattern). In this case, you may try to refactor to one of these patterns and verify whether it has helped reading the code in revealing its intent more clearly.

## Nested classes

Neither ES6 nor TypeScript support [nested classes](https://en.wikipedia.org/wiki/Inner_class). Indeed, ES6 and especially ES6 modules make preferring a flat code design rather than nested structures. This is why TypeScript `namespace` is not recommanded in an ES6 module.

Nevertheless, if you want some kind of nested classes, these constructs can be appropriate surrogates:

- Classes in an ES6 module that are not exported.
- Classes defined in a function.

## Class pitfalls and TypeScript safety net

Classes are well supported in TypeScript because they gather an object type and an object/instance factory (the constructor) in the same place. Type inference is made easier. But it leads to using a `constructor` combined with the `new` operator, both usual tricks in JavaScript especially regarding the `this` keyword, while it's the routine of C#/Java programmers.

Hopefully, TypeScript prevents some common mistakes:

- A constructor can still have an explicit return statement, different from the implicit `this`, but the return value must have a compatible type with the current class. Otherwise, we get the error `Return type of constructor signature must be assignable to the instance type of the class`.
- Calling the class constructor without the `new` operator, e.g. `const todo = Todo();`, gives the error `value of type 'typeof Todo' is not callable. Did you mean to include 'new'?`.

## TypeScript interfaces

Interfaces in TypeScript are used not only to name object and function types, but also to define abstractions. It allows to apply the _"Program to an 'interface', not an 'implementation'"_ advice given in [GoF Design Patterns](https://en.wikipedia.org/wiki/Design_Patterns), from which derived the last two [SOL**ID** principles](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)):

- [**I**nterface segregation principle (ISP)](https://en.wikipedia.org/wiki/Interface_segregation_principle)
- [**D**ependency inversion principle (DIP)](https://en.wikipedia.org/wiki/Dependency_inversion_principle)

For me it's the advantage of TypeScript over JavaScript regarding OOP.

Notice that a class can be used as an interface: `class ClassA implements ClassB` is allowed. Indeed, TypeScript applies [structural typing](https://en.wikipedia.org/wiki/Structural_type_system). This is useful to turn dependency injection to dependency inversion for free and to create test doubles easily:

```ts
class Foo {
    a = 'a';
}
class Bar {
    constructor(public foo: Foo) {}
}
const bar = new Bar({ a: 'abc' });
```

However, beware that interfaces strictly identical to their implementations are not **abstractions**. This kind of interfaces are easy to make using the "extract interface" refactoring technique that most modern IDEs now offer. They are useful to enable loose coupling, especially with a DI container that handles the matching between interfaces and implementations. But they are not abstractions! Mark Seemann in its article [Interfaces are not abstractions](http://blog.ploeh.dk/2010/12/02/Interfacesarenotabstractions/) is very clear about it:

> Having only one implementation of a given interface is a code smell.

I invite you to read its article coming right after the previous one, [Towards better abstractions](http://blog.ploeh.dk/2010/12/03/Towardsbetterabstractions/), that provides some guidance for a good interface design. Its examples, although given in C#, are still readable and valuable for TypeScript programmers.

## TypeScript programming style

TypeScript leads developers to adopt its own programming style, in between ES6 and C#/Java. Using classes, interfaces, generics is made possible, which can be the choice of programmers with C#/Java background.

If it's done extensively, the code may come to resemble more C#/Java than JavaScript, including unnecessary `public` keywords, unnecessary type declarations that can be inferred from the value, ...!

It's better to have learned core JavaScript deeply to make good JavaScript with TypeScript and envoy what it provides:

- Safety net and dependencies made more explicit with typings,
- Missing features in JavaScript like encaspulation, "read-only-ability",
- ...

JavaScript also enables a more _functional programming_ way of coding. It's one of the [two pillars of JavaScript](https://medium.com/javascript-scene/the-two-pillars-of-javascript-pt-2-functional-programming-a63aa53a41a4). TypeScript does not inhibit such programming style but its type inference is in this case more "limited" and coding may be less easy, less fluid. So TypeScript may not be the perfect choice but you can try, perhaps with the help of additional libraries like [ImmutableJs](https://github.com/facebook/immutable-js), [Ramda](http://ramdajs.com/), [Fantasy-Land](https://github.com/fantasyland), [Fluture](https://github.com/fluture-js), [Folktale](http://folktale.origamitower.com/)
, [Sanctuary](https://github.com/sanctuary-js)... Or you can opt for another higher-level language that compile back to JavaScript, like F# with [Fable](http://fable.io/) or OCaml with [Reason(ML)](https://reasonml.github.io/). But this is out of the scope of this article.

## TypeScript type tricks

Another difficulty with TypeScript classes relates to types:

- Types are seen at the TypeScript level i.e. at compile-time.
  - The type of an instance of class A is A.
  - The type of any literal object `o` is given by `typeof o`. So `typeof new Todo()` is `Todo`.
  - A type can be named/aliased using the `type` keyword: `const foo = { bar: 'baz' }; type Foo = typeof foo; // { bar: string; }`. The last line is not transpiled to JavaScript, as interfaces.
  - These types can be used as argument types (`function do(f: Foo) {...}`) and with generic functions (`function da<T extends Foo>(f: T) {...}`).
- Classes remains function constructor at runtime. They can be stored in variables (the type of the variable `const TodoCtor = Todo;` is `typeof Todo`) and specified as argument **value**, with several possible generic types:
  - `Function`: to call `apply`, `bind`, `call` or access the `prototype` property
  - `type Constructor<T> = new (...args: any[]) => T;`:
    - to encapsulate the call to `new MyClass()`: `function instanciate<T>(ctor: Constructor<T>) { return new ctor(); }` and then `const todo = instanciate(Todo);`
    - to encapsulate the call to `extends MyClass` in a class factory: cf. [Mixin Classes](https://blog.mariusschulz.com/2017/05/26/typescript-2-2-mixin-classes).
- The type of the `prototype` of the class `Todo` is `Todo`: this is an approximation because the prototype has only the class methods, not the class properties.

## Conclusion

Even with the nicer syntax in ES6, the "class pattern" is still considered as an overkill by a part of JavaScript community:

- [`class` isn’t a baby  —  it’s a monster!](https://medium.com/@_ericelliott/class-isn-t-a-baby-it-s-a-monster-807a0f0b1298),
- [Why Composition is Harder with Classes](https://medium.com/javascript-scene/why-composition-is-harder-with-classes-c3e627dcd0aa).

Indeed, object literals and factories may do the job easier and better in most cases.

But it's quite a different thing with TypeScript classes because there are enough additional features to balance class pattern issues. It's part of what TypeScript offers to enable a classical OOP using for instances [GoF Design Patterns](https://en.wikipedia.org/wiki/Design_Patterns) and [SOLID principles](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)). It can easier and more totally fulfill C#/Java programmer needs. This is one of the reasons why [Angular](https://angular.io/) favors TypeScript and why Angular components are class-based.

We have not yet analyse and discuss about [class inheritance](class-inheritance.md), supported by both ES6 and TypeScript. But this conclusion remains valid because we can use classes with or without class inheritance.