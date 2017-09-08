const noop = () => {};

const symbol = {
  apply: Symbol('apply'),
  get: Symbol('get'),
};

const $_ = {
  // private
  opts: Symbol('opts'),
  handler: Symbol('handler'),
  source: Symbol('source'),
  proxyHandler: Symbol('proxyHandler'),
};

class main {
  constructor(handler, opts = {}) {
    const $ = this.constructor.symbol; // public static
    this[$_.opts] = opts;
    this[$_.handler] = handler;
    if (!this[$_.handler]) {
      throw new Error('Need a handler');
    }
    if (typeof this[$_.handler] === 'function') {
      this[$_.handler] = {
        [$.apply]: this[$_.handler],
        [$.get]: this[$_.handler]
      };
    }
    this[$_.handler][$.apply] = this[$_.handler][$.apply] || noop;
    this[$_.handler][$.get] = this[$_.handler][$.get] || noop;
    this[$_.source] = function(...args) { return this[$_.handler][$.apply](this[$_.source], this, args) };
    this[$_.proxyHandler] = {};
    this[$_.proxyHandler].apply = (target, thisArg, args) => {
      const ret = this[$_.handler][$.apply].apply(recurse, args);
      if (ret === undefined && this[$_.opts].resumeChainOnUndefined !== false) {
        return recurse;
      } else {
        return ret;
      }
    };
    this[$_.proxyHandler].get = (target, prop, recv) => {
      let ret;
      if (prop in this[$_.handler]) {
        ret = this[$_.handler][prop].call(recurse);
      } else {
        ret = this[$_.handler][$.get].call(recurse, prop);
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
    const recurse = new Proxy(this[$_.source], this[$_.proxyHandler]);
    return recurse;
  }
}

main.symbol = symbol

module.exports = main;
