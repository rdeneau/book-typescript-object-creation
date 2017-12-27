# JavaScript Object Creation _From ES5, ES6 to TypeScript_

![Creational Design Patterns](img/patterns.jpg)
_(Credit: [web.njit.edu](https://web.njit.edu/~sdr3/DesignPatterns/creational.html))_

> ⚠️ Work in progress! 🚧

In this book, we will talk about _object-oriented programming_ (OOP) in JavaScript, more specifically in its base: creating objects, including composition techniques and inheritance. In fact, I should write JavaScript**s** because we will consider ECMAScript 5 (ES5), ECMAScript 6 (ES6 / ES2015) and even more **TypeScript**, adding a bit of typings when necessary to clarify code intents, when type inference is not possible, but without loosing flexibility and easiness of coding.

There are many ways to create objects in OOP language, and even more in JavaScript. We will explore them from the simpler yet powerful _object literals_ to some more advanced patterns like _factory functions_ and _fluent builders_, via comparing _ES6 classes_ versus _constructor functions_ versus _mixins_ which are source of debates, especially when talking about _inheritance_. We will also talk about _traits_, a more robust kind of mixins, and _talents_, a kind of dynamic traits. Finally we will consider _immutability_, seeking how to create immutable objects.

<!--

Tips:

- [Complete list of github markdown emoji markup]((https://gist.github.com/rxaviers/7360908)

--

Ideas

Several instances of the same type
=> encapsulate this creation in factory functions
=> issue with methods copied that can be shared

-->