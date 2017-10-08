JavaScript Object Creation with ES6 and TypeScript
=======

![Creational Design Patterns](img/patterns.jpg)
_(Credit: https://web.njit.edu/~sdr3/DesignPatterns/creational.html)_

## Intro

TODO

JS = language implicitly typed
=> No need to create a "type". Just create an object literal and it carries its type with itself.

Several instances of the same type
=> encapsulate this creation in factory functions
=> issue with methods copied that can be shared

Share methods => use the prototype
=> Object.create()
=> Factory functions
=> Constructor function
=> ES6 class (object literal => Object instance, as if created with new Object())

Advanced pattern like fluent builder (other article)

Inheritance
- "Classic" inheritance
  => Constructor function
  => ES6 class
- "Functional" inheritance
  => Mixin
  => Trait
