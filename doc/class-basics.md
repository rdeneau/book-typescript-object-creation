# Class

A JavaScript object literal mixes values and a type, dynamically: the type may evolve as values change their type, are added or deleted. The object can even have children using [`Object.create()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create).

Classes have been introduced in JavaScript with ECMAScript-6 (ES6):

- First to replace the previous pattern that simulated classes and was used for a long time, even before `Object.create()`,
- Then to offer a way to split a type from an object i.e. from a collection of keys/values, when this type is not meant to change, thus to handle static typing.

TypeScript goes further, offering member visibility to handle encapsulation and interfaces to... TODO: terminer ()

TODO: diff entre propriété définie hors du constructor et dans le constructor en tant qu'arguments

<!-- TOC depthFrom:2 depthTo:2 -->

- [ES6 class](#es6-class)
- [TypeScript class](#typescript-class)
- [Class prototype](#class-prototype)
- [TypeScript interfaces](#typescript-interfaces)
- [Class pitfalls](#class-pitfalls)
- [Type tricks](#type-tricks)

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

TypeScript fully supports ES6 class, proposing an enhanced syntax to simplify giving member types and to handle member encapsulation (`public` by default, `protected` or `private`) and life time (`readonly` to mimic a get-only property).

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

This can be simplified and enhanced :

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

## Class prototype

So the object properties are stored directly in the object, each instance having its own state, while the methods are stored in the class/constructor prototype i.e. in the object `__proto__`, all instances sharing the class behaviour.

An object can also have a property which is a function. We are in between state and behaviour. This a useful to split an algorithm into invariant versus variant parts. This kind of properties are conceptually similar to [Strategy](https://en.wikipedia.org/wiki/Strategy_pattern) classes reduced to only one function or a method of the [Template method pattern](https://en.wikipedia.org/wiki/Template_method_pattern). In this case, you may try to refactor to one of these patterns and verify whether it has helped reading the code in revealing its intent more clearly.

Indeed, TypeScript is much more class friendly than pure JavaScript. So TypeScript code may ressemble more to C#/Java than to usual JavaScript. If you opt for a more _functional programming_ way of coding in JavaScript, TypeScript may not be the perfect choice but you can try, perhaps with the help of additional libraries like [ImmutableJs](https://github.com/facebook/immutable-js), [Ramda](http://ramdajs.com/), [Fantasy-Land](https://github.com/fantasyland), [Fluture](https://github.com/fluture-js), [Folktale](http://folktale.origamitower.com/)
, [Sanctuary](https://github.com/sanctuary-js)... Or you can opt for another higher language that compile back to JavaScript, like F# and [Fable](http://fable.io/), OCaml and [Reason(ML)](https://reasonml.github.io/). But this is out of the scope of this article.

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

## Class pitfalls

Classes are well supported in TypeScript because they gather an object type and an object/instance factory (the constructor) in the same place. Type inference is made easier. But it leads to using a `constructor` combined with the `new` operator, both with tricks in JavaScript espacially regarding the `this` keyword, while it's the routine of C#/Java programmers. Hopefully, TypeScript prevents some common mistakes:

- A constructor can still have an explicit return statement, different from the implicit `this`, but the return value must have a compatible type with the current class. Otherwise, we get the error `Return type of constructor signature must be assignable to the instance type of the class`.
- Calling the class constructor without the `new` operator, e.g. `const todo = Todo();`, gives the error `value of type 'typeof Todo' is not callable. Did you mean to include 'new'?`.

## Type tricks

Another difficulty with TypeScript class relates to types:

- Types are seen at the TypeScript level i.e. at compile-time.
  - The type of an instance of class A is A.
  - The type of any literal object `o` is given by `typeof o`. So `typeof new Todo()` is `Todo`.
  - A type can be named/aliased using the `type` keyword: `const foo = { bar: 'baz' }; type Foo = typeof foo; // { bar: string; }`. The last line is not transpiled to JavaScript, as interfaces.
  - These types can be used as argument types (`function do(f: Foo) {...}`) and with generic functions (`function da<T extends Foo>(f: T) {...}`).
- Classes remains function constructor at runtime. They can be stored in variables (the type of the variable `const TodoCtor = Todo;` is `typeof Todo`) and specified as argument **value**, with several possible generic types:
  - `Function`: to call `apply`, `bind`, `call` or access the `prototype` property
  - `type Constructor<T> = new (...args: any[]) => T;`:
    - to encapsulate the call to `new MyClass()`:  `function instanciate<T>(ctor: Constructor<T>) { return new ctor(); }` and then `const todo = instanciate(Todo);`
    - to encapsulate the call to `extends MyClass` in a class factory: cf. [Mixin Classes](https://blog.mariusschulz.com/2017/05/26/typescript-2-2-mixin-classes).
- The type of the `prototype` of the class `Todo` is `Todo`: this is an approximation because the prototype has only the class methods, not the class properties.
