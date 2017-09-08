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

  let proxy;

  const get = (t, prop) => {
    let result;
    if (prop in keys) {
      result = keys[prop].call(proxy);
    } else {
      result = all.call(proxy, prop);
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
          return proxy;
        }
      }
      return new Proxy(returnFn, { get });
    } else {
      return proxy;
    }
  };

  proxy = new Proxy({}, { get });

  return proxy;
};
