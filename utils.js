const utils = exports;

utils.noop = () => {};

utils.findKey = map => (prop, ...prev) => {
  const keyChain = typeof prop === 'string' && !prev.find(p => typeof prop !== 'string') ? [prop, ...prev].reverse().join('.') : null;
  if (map.has(prop)) {
    return map.get(prop);
  } else if (keyChain && map.has(keyChain)) {
    return map.get(keyChain);
  } else if (typeof prop === 'string') {
    for (const key of map.keys()) {
      let regex = key;
      if (!(regex instanceof RegExp) && regex.startsWith('/') && regex.endsWith('/')) {
        regex = new RegExp(regex.substr(1, regex.length - 2));
      }
      if (regex instanceof RegExp && (regex.test(prop) || (keyChain && regex.test(keyChain)))) {
        return map.get(key);
      }
    }
  }
}
