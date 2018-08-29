const utils = exports;

utils.noop = () => {};

utils.findKey = map => (prop, ...prev) => {
  const keyChain = typeof prop === 'string' && !prev.find(p => typeof prop !== 'string') ? [prop, ...prev].reverse().join('.') : null;
  if (map.has(prop)) {
    return map.get(prop);
  } else if (keyChain && map.has(keyChain)) {
    return map.get(keyChain);
  }
}
