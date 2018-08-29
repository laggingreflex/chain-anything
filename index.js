const noop = () => {};

module.exports = (all, keys, opts) => {
  if (!opts) {
    opts = {};
    if (!keys) {
      keys = {};
      if (typeof all !== 'function') {
        keys = all;
        all = noop;
      }
    }
  }

  if (typeof all !== 'function') {
    throw new Error('Invalid arguments: all needs to be a function');
  }
  if (!keys) {
    throw new Error('Invalid arguments: keys need to be an object');
  }
  if (!opts) {
    throw new Error('Invalid arguments: opts need to be an object');
  }

  const createProxy = (from, ...prev) => new Proxy(from, {
    get: (t, prop) => get(t, prop, ...prev)
  });

  let proxy;

  const get = (t, prop, ...prev) => {
    let result;
    if (prop in keys) {
      result = keys[prop].call(proxy, ...prev);
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
          return createProxy({}, prop, ...prev)
        }
      }
      return createProxy(returnFn, prop, ...prev)
    } else {
      return createProxy({}, prop, ...prev)
    }
  };

  proxy = createProxy({});

  return proxy;
};
