"use strict";
const mathConstants = Object.create({}, { pi: { value: 3.1416, enumerable: true, writable: false } }); // [ts] Type `any`!
mathConstants.pi = 5; // No error, even in strict mode!
console.log(mathConstants); // → {pi: 3.1416}
