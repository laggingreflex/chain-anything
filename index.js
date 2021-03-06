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
  if (!opts.exclude) {
    opts.exclude = ['inspect'];
  }
  if (!Array.isArray(opts.exclude)) {
    throw new Error('Expected `opts.exclude` to be an array');
  }
  if (!('depth' in opts)) {
    opts.depth = Infinity;
  }
  if (typeof opts.depth !== 'number') {
    throw new Error('Expected `opts.depth` to be a number');
  }

  const createProxy = (base, ...prev) => new Proxy(base, {
    get: (t, prop) => {
      if (typeof prop !== 'string' || opts.exclude.includes(prop)) {
        return opts.base[prop];
      }
      if (opts.inherit !== false) {
        return prop in t ? t[prop] : get(prop, ...prev)
      } else {
        return get(prop, ...prev)
      }
    },
    set: (t, prop, value) => {
      let base = opts.base;
      for (const prop of Array.from(prev).reverse()) {
        if (!base[prop]) base[prop] = {};
        base = base[prop];
      }
      base[prop] = value;
      return true;
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
        } else if (prev.length < opts.depth) {
          return createProxy(opts.base, prop, ...prev)
        }
      }
      if (prev.length < opts.depth) {
        return createProxy(returnFn, prop, ...prev)
      } else {
        return returnFn;
      }
    } else if (prev.length < opts.depth) {
      return createProxy(opts.base, prop, ...prev)
    }
  };

  proxy = createProxy(opts.base);

  return proxy;
};
