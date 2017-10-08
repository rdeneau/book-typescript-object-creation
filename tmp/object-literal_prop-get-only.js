"use strict";
const mathConstants = { get pi() { return 3.1416; } }; // [ts] { readonly pi: number; }
console.log(mathConstants); // → (Chrome) {}
                            // → (Node) { pi: [Getter] }
mathConstants.pi = 5; // Uncaught TypeError: Cannot set property pi of #<Object> which has only a getter
