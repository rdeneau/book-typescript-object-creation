# References

## Articles

### [A fresh look at JavaScript Mixins, by Angus Croll, 2011](https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/)

- Classic Mixins : `Object.assign(obj || Ctor.prototype, mixinObj)`
- Functional Mixins : no need of `Object.assign()`, mixin is a function that augment its `this` context, i.e. written like a Constructor function with methods inlined (i.e. not defined in the prototype, aka _constructor with privileged methods_), but used through explicit delegation (`mixinFunction.call(obj || Ctor.prototype)`) rather than via the `new` operator.
- Adding caching => module pattern.
- Adding caching + options => module pattern + currying each methods with its option(s).

### [Flight Mixins Are Awesome!, by Web Reflection, 2013](http://webreflection.blogspot.fr/2013/04/flight-mixins-are-awesome.html)

- Same as Angus Croll article but the term "Flight Mixin" when it's used with the `Ctor.prototype`.

### [DRY JavaScript with mixins, by Bob Yexley, 2013](http://bob.yexley.net/dry-javascript-with-mixins/)

- Not interesting ; still using `extends` function i.e. classic mixin.

### [JavaScript Code Reuse Patterns, Function Based Object/Type Composition - Slides by Peter Seliger, 2013](webtechconf-2013_JavaScript-Code-Reuse-Patterns_Function-Based-Object-and-Type-Composition.pdf)

### [The many talents of JavaScript for generalizing Role Oriented Programming approaches like Traits and Mixins, by Peter Seliger, 2014](http://peterseliger.blogspot.fr/2014/04/the-many-talents-of-javascript.html#the-many-talents-of-javascript-for-generalizing-role-oriented-programming-approaches-like-traits-and-mixins)

### [Mixins, Forwarding, and Delegation in JavaScript, by Reg “raganwald” Braithwaite, 2014](http://raganwald.com/2014/04/10/mixins-forwarding-delegation.html)

Exposing 4 Prototype-less techniques for separating object behaviour from object properties:

|                      | Early-bound   | Late-bound |
| -------------------- | ------------- | ---------- |
| Receiver’s context   | Mixin         | Delegation |
| Metaobject’s context | Private Mixin | Forwarding |

### ["Real" Mixins with JavaScript Classes, by Justin Fagnani, Dec 2015](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/)

### Rest

http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
http://raganwald.com/2015/06/17/functional-mixins.html
http://raganwald.com/2015/06/26/decorators-in-es7.html
http://raganwald.com/2015/12/28/mixins-subclass-factories-and-method-advice.html
http://raganwald.com/2016/07/16/why-are-mixins-considered-harmful.html
http://raganwald.com/2016/07/20/prefer-composition-to-inheritance.html

https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750
=> Discuss React Component and React Mixin
=> Like Justin Fagnani Class Mixin, with React.createClass(), applied to Component = A higher-order component is just a function that takes an existing component and returns another component that wraps it.

https://medium.com/javascript-scene/the-two-pillars-of-javascript-ee6f3281e7f3
https://medium.com/javascript-scene/why-composition-is-harder-with-classes-c3e627dcd0aa
https://medium.com/javascript-scene/javascript-factory-functions-with-es6-4d224591a8b1
https://medium.com/javascript-scene/functional-mixins-composing-software-ffb66d5e731c
https://medium.com/javascript-scene/composing-software-an-introduction-27b72500d6ea
-- TypeScript
https://www.stevefenton.co.uk/2017/08/typescript-mixins-part-two/
https://blog.mariusschulz.com/2017/05/26/typescript-2-2-mixin-classes
https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript#support-for-mix-in-classes
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
ES6 classes
→ support pour voir les diff avec les classes TS
→ explains mix-ins
https://github.com/Microsoft/TypeScript/pull/13743
→ Discussion avec le PR d'Anders Hejlsberg sur les mixins
https://medium.com/javascript-scene/introducing-the-stamp-specification-77f8911c2fee


## Papers

### [Traits: Composable units of Behavior" (Scharli et al., ECOOP 2003)](Traits - Composable units of Behavior (2003).pdf)

The original presentation of traits, including a deep discussion on the advantages of traits over mixins and multiple inheritance.

[Link](http://scg.unibe.ch/archive/papers/Scha03aTraits.pdf)

### [Adding State and Visibility Control to Traits using Lexical Nesting" (Van Cutsem et. al, ECOOP 2009)](Traits - Adding State and Visibility Control to Traits using Lexical Nesting (2009).pdf)

Describes a trait system in a lexically-scoped, object-based language similar in style to Javascript.

[Link](https://soft.vub.ac.be/Publications/2009/vub-prog-tr-09-04.pdf)

### [Talents - Dynamically Composable Units of Reuse](Talents - Dynamically Composable Units of Reuse.pdf)

Mentioned by CocktailJS

[Link](http://scg.unibe.ch/archive/papers/Ress11a-Talents.pdf)

## Libraries

### [traits.js](https://github.com/traitsjs/traits.js)

[Paper intro](Traits - Robust Trait Composition for Javascript - Intro to Traits.js.pdf)

### [CocktailJS](http://cocktailjs.github.io/)

CocktailJS is a small library for NodeJS to help developers defining classes and modules in a better, more readable and organised way. It also explores other technics to reuse code such as **Annotations**, **Traits** and **Talents**.

**Traits** are _Composable Units of Behaviour_ (cf. paper). Basically, a Trait is a Class, but a special type of Class that has only behaviour (methods) and no state. Traits are an alternative to reuse behaviour in a more predictable manner. They are more robust than Mixins, or Multiple Inheritance since name collisions must be solved by the developer beforehand.

**Talents** are very similar to Traits, in fact a Trait can be applied as a Talent in CocktailJS. The main difference is that a Talent can be applied to an object or module. So we can define a Talent as a Dynamically Composable Unit of Reuse (cf. paper).

### [Joose](https://github.com/Joose/Joose)

- A postmodern class system for JavaScript
- Support Roles:
  - _from (webtechconf-2013_JavaScript-Code-Reuse-Patterns_Function-Based-Object-and-Type-Composition.pdf)_
  - Any _function_ that is a container for at least one public behavior or acts as collection of more than one public behavior
  - is intended to neither being invoked by the call operator `fn()` nor with the `new` operator
  - but always should be applied to objects by invoking one of the [Function]s call methods - either `call` or `apply`.

### [TypeScript Mix](https://github.com/michaelolof/typescript-mix)

```ts
const buyer = {
  price: undefined as number,
  buy() {
    console.log("buying items at #", this.price);
  },
  negotiate(price: number) {
    console.log("currently negotiating...");
    this.price = price;
  },
}

type Buyer = typeof buyer;

// --

class Transportable {
  distance: number;
  transport() {
    console.log(`moved ${this.distance}km.`);
  }
}

// --
import use from "typescript-mix";

interface Shopperholic extends Buyer, Transportable {}

class Shopperholic {
  @use(buyer, Transportable) this

  price = 2000;
  distance = 140;
}
```