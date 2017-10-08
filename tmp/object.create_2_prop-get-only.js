"use strict";
const mathConstants = Object.create({}, { pi: { get: () => 3.1416, enumerable: true } }); // [ts] Type `any`!
console.log(mathConstants); // → (Chrome) {}
                            // → (Node) { pi: [Getter] }
mathConstants.pi = 5; // Uncaught TypeError: Cannot set property pi of #<Object> which has only a getter
