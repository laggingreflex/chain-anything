# chain-anything

A minimal chaining library using ES Proxy.

## Install

```sh
npm install chain-anything
```

## Usage

```js
const chain = require('chain-anything');
const handler = {
  // use special symbols provided by the library
  [chain.symbol.apply] (...args) {
    // called whenever a function is called
    console.log('apply:', ...args);
  },
  [chain.symbol.get] (key) {
    // called whenever a property key is accessed
    console.log('get:', key);
  },
  // or use any custom properties
  custom () {
    // called whenever a `.custom` property is accessed
    // you may return a function here for it to be treated as such
    return (...args) => {
      // called whenever a `.custom()` function is called
      // The chain ends when you return something
      return 'end';
    }
  }
}
const chained = chain(handler)

const result = chained('a').b('c').d.e.custom();
console.log('result = ', result);
```
<blockquote><pre>
apply: a
get: b
apply: c
get: d
get: e
result = end
</pre></blockquote>
