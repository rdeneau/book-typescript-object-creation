# Object Producers

> ⚠️ **Work in progress**

## Factory functions

=> independant functions, avec ou sans arguments. Si sans arguments => un des types de providers de DI container d'Angular
=> class static methods

## Abstract factory classes

=> Zoran Orvat:

- centralise les dépendances, empêchant leur fuite jusqu'à la classe racine
- renvoyant un type abstrait (interface, classe abstraite), parfois obligé de faire du downcasting côté client pour récupérer un type concret

## Builder classes

## Fluent builders

=> Zoran Orvat pattern