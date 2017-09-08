const noop = () => {};

const symbol = {
  apply: Symbol('apply'),
  get: Symbol('get'),
  opts: Symbol('opts'),
};

const $ = {
  opts: Symbol('opts'),
  handler: Symbol('handler'),
};

class main {
  constructor(handler, opts = {}) {
    this[$.opts] = opts;
    this[$.handler] = handler;
    if (!this[$.handler]) {
      throw new Error('Need a handler');
    }
    if (typeof this[$.handler] === 'function') {
      this[$.handler] = {
        [symbol.apply]: this[$.handler],
        [symbol.get]: this[$.handler]
      };
    }
    this[$.handler][symbol.apply] = this[$.handler][symbol.apply] || noop;
    this[$.handler][symbol.get] = this[$.handler][symbol.get] || noop;
    const source = function(...args) { return this[$.handler][symbol.apply](source, this, args) };
    const proxyHandler = {};
    proxyHandler.apply = (target, thisArg, args) => {
      const ret = this[$.handler][symbol.apply].apply(recurse, args);
      if (ret === undefined && this[$.opts].resumeChainOnUndefined !== false) {
        return recurse;
      } else {
        return ret;
      }
    };
    proxyHandler.get = (target, prop, recv) => {
      let ret;
      if (prop in this[$.handler]) {
        ret = this[$.handler][prop].call(recurse);
      } else {
        ret = this[$.handler][symbol.get].call(recurse, prop);
      }
      if (ret === undefined && opts.resumeChainOnUndefined !== false) {
        return recurse;
      } else if (typeof ret === 'function') {
        return function(...args) {
          const retRet = ret.apply(this, args);
          if (retRet === undefined && opts.resumeChainOnUndefined !== false) {
            return recurse;
          } else {
            return retRet;
          }
        }
      } else {
        return ret;
      }
    };
    const recurse = new Proxy(source, proxyHandler);
    return recurse;
  }
}

main.symbol = symbol

module.exports = main;
