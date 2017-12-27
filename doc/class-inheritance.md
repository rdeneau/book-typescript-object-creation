# Class inheritance

## Warning foreword

> Inheritance should be used with care, due to the strong coupling between base and derived classes, breaking the [S**O**LID Open/Closed Principle](https://en.wikipedia.org/wiki/Open/closed_principle). Ask yourself the question: "Is there really a 'is-a' relationship between both classes?". Any kind of [object composition](./object-composition.md) i.e. 'has-a' relationship should be considered first or during a refactoring phase (cf. [Red/Green/Refactor TDD mantra](https://en.wikipedia.org/wiki/Test-driven_development#Development_style)).
>
> Nevertheless, inheritance should not be banned too. Every technique has its advantages and drawbacks and can be appropriate in some situations. For instance, inheritance is used in the [Template Method Pattern](https://en.wikipedia.org/wiki/Template_method_pattern), despite the fact that [Composition over inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance) is a principle  given and applied in [GoF Design Patterns](https://en.wikipedia.org/wiki/Design_Patterns).

TODO

`extends` (!= for interfaces)
`super()` in `constructor` (at the beginning, even if base class does not have an explicit constructor) vs `super.prop` in properties.
