# Class alternatives

> ⚠️ **Work in progress**

A JavaScript object literal mixes values and a type, dynamically: the type may evolve as values change their type, are added or deleted. The object can even have children using [`Object.create()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create).

Classes have been introduced in JavaScript with ECMAScript-6 (ES6):

- First to replace the previous pattern that simulated classes and was used for a long time, even before `Object.create()`,
- Then to offer a way to split a type from an object i.e. from a collection of keys/values, when this type is not meant to change, thus to handle static typing.

TypeScript goes further, offering member visibility to handle encapsulation and interfaces to... TODO: terminer ()
