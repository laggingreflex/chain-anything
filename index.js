const utils = require('./utils');

module.exports = (all, keys, opts) => {
  if (!opts) {
    opts = {};
    if (!keys) {
      keys = {};
      if (typeof all !== 'function') {
        keys = all;
        all = utils.noop;
      }
    }
  }

  if (typeof all !== 'function') {
    throw new Error('Invalid arguments: all needs to be a function');
  }
  if (!keys) {
    throw new Error('Invalid arguments: keys need to be an object');
  }
  if (!(keys instanceof Map)) {
    const map = new Map;
    for (const key in keys) {
      map.set(key, keys[key]);
    }
    keys = map;
  }
  if (!opts) {
    throw new Error('Invalid arguments: opts need to be an object');
  }
  if (!opts.base) {
    opts.base = {};
  }

  const createProxy = (base, ...prev) => new Proxy(base, {
    get: (t, prop) => {
      if (opts.inherit !== false) {
        return prop in t ? t[prop] : get(prop, ...prev)
      } else {
        return get(prop, ...prev)
      }
    },
  });

  const findKey = utils.findKey(keys);

  let proxy;

  const get = (prop, ...prev) => {
    let result;
    const keyFn = findKey(prop, ...prev);
    if (keyFn) {
      result = keyFn.call(proxy, prop, ...prev);
    } else {
      result = all.call(proxy, prop, ...prev);
    }
    if (result !== undefined && typeof result !== 'function') {
      return result;
    } else if (typeof result === 'function') {
      const fn = result;
      const returnFn = (...args) => {
        const result = fn.call(proxy, ...args);
        if (result !== undefined) {
          return result;
        } else {
          return createProxy(opts.base, prop, ...prev)
        }
      }
      return createProxy(returnFn, prop, ...prev)
    } else {
      return createProxy(opts.base, prop, ...prev)
    }
  };

  proxy = createProxy(opts.base);

  return proxy;
};
