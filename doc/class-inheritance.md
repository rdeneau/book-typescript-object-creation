# Class inheritance

Inheritance is a feature of object-oriented programming (OOP) languages that allows to define:

- a base class, aka superclass, mother class, that provides specific functionality: data and behavior,
- derived classes, aka subclasses, child classes, that reuse (inherits), extend, or modify (override) that functionality.

ES6 and by extension TypeScript belong to the same OOP language family than C# and Java: they all support _single inheritance_ only. A class can't have more than one direct base class. However, as inheritance is transitive, a class can have several ancestors via an inheritance hierarchy.

Notice that all classes already rely on inheritance, deriving from `Object` and so inheriting from [`hasOwnProperty()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty), [`toString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString), ...

**Contents:**

<!-- TOC depthFrom:2 depthTo:2 -->

- [`extends` versus `implements` keywords](#extends-versus-implements-keywords)
- [Prototype chain](#prototype-chain)
- [`super` keyword](#super-keyword)
- [Member inheritance](#member-inheritance)
- ["is a" relationship](#is-a-relationship)
- [Use cases](#use-cases)
- [Issues](#issues)
- [Conclusion](#conclusion)

<!-- /TOC -->

## `extends` versus `implements` keywords

ES6 and even more TypeScript shares the same keywords as Java regarding (class) inheritance, (interface) extension and implementation (of an interface by a class):

| Language   | Inheritance | Extension | Implementation |
| ---------- | ----------- | --------- | -------------- |
| ES6        | `extends`   | ×         | ×              |
| TypeScript | `extends`   | `extends` | `implements`   |
| Java       | `extends`   | `extends` | `implements`   |
| C#         | `:`         | `:`       | `:`            |

It's nice to have two keywords, `extends` and `implements`, to differentiate between implementation and inheritance/extension, comparing to C# and its single and multi-use `:` operator. IMO, it would have been better to have three keywords, for instance `inherits` for inheritance!

## Prototype chain

We have seen that the `class` keyword is just some [syntactical sugar](class-basics.md#syntactical-sugar) over the function `prototype` property. It's the same for the `extends` keyword. The expression `class Child extends Base {}` is equivalent to:

```js
__extends(Child, Base);
function Child() {}
```

with the following helper function `__extends()`:

```js
function __extends(derived, base) {
    Object.setPrototypeOf(derived, base);              // Copy base class static members
    derived.prototype = Object.create(base.prototype); // Copy base class instance members
}
```

[`Object.create()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create) is a proposal from Douglas Crockford's [prototypal inheritance technique](http://crockford.com/javascript/prototypal.html) to avoid the `new` operator, too much Java/class-like, and to provide JavaScript its own technique to make object inheritance.

It can be rewritten using `__proto__` to be read easier:

```js
function __extends(derived, base) {
    derived.__proto__           = base;             // Copy base class static members
    derived.prototype.__proto__ = base.prototype;   // Copy base class instance members
}
```

So classes and inheritance use the same technique based on the _prototype chain_. Calling `new Child().member`, `member` can be looked up in:

- Level 1: the own instance properties, defined in `Child` constructor,
- Level 2: the `__proto__` property, containing:
  - The methods of the `Child` class,
  - The properties defined by the mother class of `Child`, i.e. in `Base` constructor,
- Level 3: `__proto__.__proto__`:
  - The methods of the `Base` class,
  - The properties defined by the mother class of `Base`, i.e. in `Object` constructor,
- Level 4: `__proto__.__proto__.__proto__`:
  - The methods of the `Object` class.

It's already 4 level deep! This member lookup can be expensive depending on the JavaScript engine. Ultra reactive applications should use these techniques with care and may prefer a design with a flatter prototype chain usage.

By the way, this type of functionality sharing between objects is called [delegation](https://en.wikipedia.org/wiki/Delegation_%28object-oriented_programming%29) because the shared members are evaluated in the current object context: calling `o.a()`, `this` inside `a()` refers to `o` wherever it has been provided/delegated in the prototype chain.

## `super` keyword

The `super` keyword serves two purposes:

### Base class constructor

In a derived class constructor, `super` is a function representing the base class constructor. As soon as a derived class has a constructor, this constructor must start with a call to the super class constructor with the expected arguments:

```ts
abstract class Person {
    constructor(readonly name: string) { }
}

class William extends Person {
    Surname = 'Bill';
    constructor() {
        super('William'); // super: constructor Person(name: string): Person
    }
}
```

`William` constructor is equivalent to the following ES5 constructor function where we see that:

- The base constructor `Person` is called with the value `this` as first argument, followed by the expected constructor arguments.
- The function returns the base constructor return value or `this`.

```ts
function William() {
    var _this = Person.call(this, 'William') || this;
    _this.Surname = 'Bill';
    return _this;
}
```

### Base class members

We can use `super` to access the base class members from an overriding member the same way we are using `this` for the current class members:

```ts
abstract class Base {
    do() { }
}

class Child extends Base {
    do() {
        super.do(); // super: class Base
    }
}
```

- `super` has the type of the super class type, here `Base`.
- `super.do()` is another syntactical sugar, equivalent of `Base.prototype.do.call(this);`.

## Member inheritance

Some members are not inheritable:

- constructors: each class must define its own constructor, included the optional implicit empty constructor.
- private members in TypeScript.

All other types of members are inherited, included static members, as long as both signatures (in base and derived class) are compatible:

```ts
class Base {
    static foo = 'foo';
    static create() {
        return new Base();
    }
}

class Ok extends Base {
    static create() {
        return new Ok();
    }
}

const foo = Ok.foo;      // Base.foo inherited
const ok  = Ok.create(); // Base.create() overriden => typeof 'ok': Ok

class Ko extends Base {  // Error: Types of property 'create' are incompatible.
    static create(_: any) {
        return new Ko();
    }
}
```

### Virtual members

All inheritable members are _virtual_ by default: they can be overriden without any special keyword. TypeScript detects when an overriding member has an incompatible signature with the overriden member, to preserve polymorphism. With this example, we will have the following error message:

```ts
abstract class Base {
    do() {}
}

class Child extends Base {
    do(arg: any) {}
}
```

```txt
Class 'Child' incorrecly extends base class 'Base'.
  Types of property 'do' are incompatible.
    Type '(arg: any) => void' is not assignable to type '() => void'.
```

There is no way to prevent this "virtuality". Likewise, there's no way to prevent a class from being inherited. Indeed, the `@sealed` class decorator given in the [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/decorators.html#class-decorators) is based on [`Object.seal()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) and is used to prevent the decorated class from being modified, which is important not to fool the TypeScript IntelliSense. Not to be confused with the [`sealed` C# keyword](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/sealed) which is approximatively the equivalent of the [`final` Java keyword](https://en.wikipedia.org/wiki/Final_%28Java%29#Final_classes). A "sealed" class can be inherited seamlessly:

```ts
function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
class GreeterBase {
    constructor(readonly greeted: string) { }

    greet() {
        return "Hello, " + this.greeted;
    }
}

class JoeGreeter extends GreeterBase {
    constructor() {
        super('Joe');
    }
}
// => No runtime errors
```

> 💡 If your IDE does not indicate when a member in a derived class overrides a base class member, a good practice in your team can be to do it manually with a comment or a Java-like `@override` decorator that checks whether it's really an override. Ryan Cavanaugh, member of the TypeScript Team @ Microsoft, has given such a decorator in [this comment](https://github.com/Microsoft/TypeScript/issues/2000#issuecomment-99158699):

```ts
const override: MethodDecorator = (target, key, descriptor) => {
    var baseType = Object.getPrototypeOf(target);
    if (typeof baseType[key] !== 'function') {
        throw new Error(`Method ${target.constructor.name}.${key} does not override any base class method`);
    }
};

class Base {
    baseMethod() {}
}

class Derived extends Base {
    @override baseMethod() {} // Works
    @override notAnOverride() {} // Causes exception
}
```

### Abstract members

TypeScript supports _abstract_ class members, i.e. members without implementation in the base class and that must be implemented in the derived class. Such a base class is abstract too: it can't be instantiated. Its constructor can be marked:

- `protected`: its the usual use case, where the base constructor is called from a derived constructor.
- `public`: but the class still cannot be instantiated directly,
- `private`: but then the class cannot be inherited so it's not very useful.

## "is a" relationship

Inheritance basically expresses an _"is a" relationship_ between a base class and one or more derived classes. A derived class _is_ a specialized version of the base class. For example, considering a `Publication` class that represents a publication of any kind, `Book` and `Magazine` classes can derived from it to represent specific types of publications.

Note that the relationship between a class and its instances is also a "is a" relationship. So derived types sometimes are not necessary, the specialization being based on member specific values. For instance, a Ford (i.e. the car, the instance) is an automobile, so we can have a `createFord()` factory method in a class `Automobile`, but there's no point having a `Ford` derived class to represent all Ford cars.

## Use cases

Adding new public members in derived classes make it more difficult for the client code to handle the whole hierarchy the same way. This usually forces the client code to [downcast](https://en.wikipedia.org/wiki/Downcasting) to access these members and this new behaviour, and so polymorphism is lost. By the way the "is a" relationship is also corrupted this way.

Likewise, trying to reduce inherited behaviours, for instance throwing an "not implemented" exception. It's more insidious and so even more problematic: it will probably break the [Liskov substitution principle (LSP)](https://en.wikipedia.org/wiki/Liskov_substitution_principle). The client code is expecting to have the full behaviour of the base class defining the contract, the abstraction. At least, it will be safer to add some `CanDo(): boolean;` methods to warn the client code about some `Do(): void` methods that may not be possible to call. But it leads to [temporal coupling design smell](http://blog.ploeh.dk/2011/05/24/DesignSmellTemporalCoupling/). No temporal coupling with `TryDo(): boolean` methods, but this design breaks [Command–query separation (CQS)](https://en.wikipedia.org/wiki/Command%E2%80%93query_separation). A better/safer/simpler design would be to compose each down classes with an instance of the previous base class.

The base class will also have an issue regarding changing inherited members:

- A member can not of course be removed because it's surely already used either in a derived class or in the client code.
- A member can not be added if it already exists in a derived class but with an incompatible signature.
- Changing a member signature must be done in the derived classes also, and probably in more client code, potentially all class hierarchy dependencies.

The only use case of inheritance IMO is when members of a (base) class need to be specialized in at least two derived classes, like in the [Template Method Pattern](https://en.wikipedia.org/wiki/Template_method_pattern). This way, the contract is identical between the base class and the derived classes. In this case, the base class is usually abstract which is a good sign that it represents some kind of abstraction.

## Issues

- _Too many levels of inheritance_ may lead to a code difficult to understand (cf. [Yo-yo problem](https://en.wikipedia.org/wiki/Yo-yo_problem)) and even more to debug.
- _Inheritance breaks encapsulation_: properties can be shared between the base class and the derived classes. A couple (base class, derived class) should not be seen as separated classes but rather as a single bigger class. Considering all derived classes at the same inheritance level, they form with their base class a rigid group. Imagine the size and complexity with a deeper hierarchy!
- [Fragile base class problem](https://en.wikipedia.org/wiki/Fragile_base_class): it's a more insiduous issue that show another type of coupling between a base class and a derived class that complexify modifying the base class. A seemingly safe modifications to a base class, considering only the base class, may cause a bug in a derived class like an infinite loop.
- At a design level, the base class represents both a dependency and an abstraction for derived classes. Usually, a basic technique to decouple such classes is to introduce interfaces, one for the dependency (for instance injected in the constructor), one for the abstraction (the class implementing the interface defining the abstraction). It's not only impossible to split these roles but also to introduce such interfaces.

## Conclusion

Class inheritance has been added to ES6 along with the class support. Both are syntactical sugars that rely on the prototype chain. Feel free to use these new syntaxes instead of older patterns to be more explicit and concise. It's in fact the only fully supported syntaxes in TypeScript.

Regarding class inheritance usage, it appears to be a fast and cheap way to share a behaviour, to factorize code. But it's usually a bad idea for the client code and for future changes in the class hierarchy. Instead of _code reuse_, prefer _design reuse_. The usual examples are given in the [GoF Design Patterns](https://en.wikipedia.org/wiki/Design_Patterns) that offer their own way to handle a kind of variation in the system, for instance:

| Pattern                                                                                  | Aspect(s) that vary              |
| ---------------------------------------------------------------------------------------- | -------------------------------- |
| [Adapter](https://en.wikipedia.org/wiki/Adapter_pattern)                                 | Object interface                 |
| [Bridge](https://en.wikipedia.org/wiki/Bridge_pattern)                                   | Object implementation            |
| [Chain-of-responsibility](https://en.wikipedia.org/wiki/Chain-of-responsibility_pattern) | Object that handles a request    |
| [Decorator](https://en.wikipedia.org/wiki/Decorator_pattern)                             | Object responsabilities          |
| [Iterator](https://en.wikipedia.org/wiki/Iterator_pattern)                               | Composite object traversal       |
| [Observer](https://en.wikipedia.org/wiki/Observer_pattern)                               | Inter-object dependency          |
| [State](https://en.wikipedia.org/wiki/State_pattern)                                     | Value-dependent object behaviour |
| [Strategy](https://en.wikipedia.org/wiki/Strategy_pattern)                               | Algorithm implementation         |
| [Visitor](https://en.wikipedia.org/wiki/Visitor_pattern)                                 | Class responsabilities           |

_Source: [Evolution of object behavior using context relations](https://www2.ccs.neu.edu/research/demeter/papers/context-journal/node2.html)_

Almost all GoF patterns rely on composition. _Composition_, in any of its [various forms](object-composition.md), usually need a bit more code but is far more safer. It's a trade-off: it may be a bit more complicated locally but will improve the overall design.

To finish, let's compare how [Angular](https://angular.io/) and [React](https://reactjs.org/) deal with classes and inheritance regarding their component creation:

- **Angular**:
  - A component is a class decorated with `@Component()` _→ No inheritance, rather [AOP](https://en.wikipedia.org/wiki/Aspect-oriented_programming)._
  - [Lifecycle Hooks](https://angular.io/guide/lifecycle-hooks) are based on methods (e.g. `ngOnInit()`) whose signatures are defined in different interfaces (e.g. `OnInit`) _→ Applying [ISP](https://en.wikipedia.org/wiki/Interface_segregation_principle)._
- **React**: [offers several approaches](https://reactjs.org/docs/components-and-props.html):
  - Functional component: no class - just a JavaScript function that takes a single arguments `props` (for properties) and returns a React element, for instance using JSX/TSX html-like syntax → _Functional approach._
  - Class component: a class extending the abstract base class [React.Component](https://reactjs.org/docs/react-component.html) and implementing at least the `render()` method or other [lifecycle methods](https://reactjs.org/docs/state-and-lifecycle.html#adding-lifecycle-methods-to-a-class) like `componentDidMount()` → _Class inheritance._
  - The factory `React.createClass()` has been [deprecated](https://reactjs.org/blog/2017/04/07/react-v15.5.0.html#migrating-from-reactcreateclass) then removed from [React 16, Sept 2017](https://github.com/facebook/react/releases/tag/v16.0.0), to favor either first two options.
