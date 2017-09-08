# chain-free

Create chains with any arbitrary properties.

<small>**Uses [ES Proxy], use only where [available][proxy-support].** </small>

[ES Proxy]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy
[proxy-support]: http://caniuse.com/proxy

## Install

```sh
npm install chain-free
```

## Usage

```js
const chain = require('chain-free')
const all = (key) => {...}
const custom = {...} // optional
const chained = chain(all, custom)
```

```js
const chained = chain(key => {
  // called on all property lookups
  console.log('Property accessed:', key)
  // you may return a function here for it to be treated as such
  return () => {
    console.log(`chained.${key}() called`)
    if (done) {
      // The chain ends when you return something
      return 'done'
      // (either from this child function or the parent property lookup)
    }
  }
}, {
  // custom functions called when accessed property name matches:
  customKey: () => {
    console.log('"customKey" property accessed')
  },
  customFn: () => () => { // <- return function from property
    console.log('"customFn" called')
    return 'result'
  },
})

const result = chained.a.b('c').d.e.customKey.customFn()
console.log('result = ', result)
```
```
<blockquote><pre>
Property accessed: a
Property accessed: b
chained.b() called
Property accessed: d
Property accessed: e
"customKey" property accessed
"customFn" called
result =  result
</pre></blockquote>
