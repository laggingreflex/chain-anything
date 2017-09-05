const noop = () => {};

const symbol = {
  apply: Symbol('apply'),
  get: Symbol('get'),
};

const main = (handler, opts = {}) => {
  if (!handler) {
    throw new Error('Need a handler');
  }
  if (typeof handler === 'function') {
    handler = {
      [symbol.apply]: handler,
      [symbol.get]: handler
    };
  }
  handler[symbol.apply] = handler[symbol.apply] || noop;
  handler[symbol.get] = handler[symbol.get] || noop;
  const source = function(...args) { return handler[symbol.apply](source, this, args) };
  const proxyHandler = {};
  proxyHandler.apply = (target, thisArg, args) => {
    const ret = handler[symbol.apply].apply(recurse, args);
    if (ret === undefined && opts.resumeChainOnUndefined !== false) {
      return recurse;
    } else {
      return ret;
    }
  };
  proxyHandler.get = (target, prop, recv) => {
    let ret;
    if (prop in handler) {
      ret = handler[prop].call(recurse);
    } else {
      ret = handler[symbol.get].call(recurse, prop);
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
};

main.symbol = symbol;

module.exports = main;
