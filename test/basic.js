describe('basic', () => {
  it('basic', () => {
    const apply = td.function();
    const get = td.function();
    const g = td.function();
    const h = td.function();

    td.when(g()).thenReturn(h);

    const chained = new chain({
      [chain.symbol.apply]: apply,
      [chain.symbol.get]: get,
      g
    });

    chained('a').b('c').d.e('f').g('h');

    td.verify(apply('a'));
    td.verify(get('b'));
    td.verify(apply('c'));
    td.verify(get('d'));
    td.verify(get('e'));
    td.verify(apply('f'));
    td.verify(h('h'));
  });

  it('custom function', (done) => {
    const custom = td.function();
    const chained = new chain({
      custom: () => text => done(assert.equal(text, 'haha'))
    });
    chained.custom('haha');
  });
  it('throws', () => {
    assert.throws(chain)
  });
  it('single function arg', (done) => {
    const chained = new chain(done)
    chained();
  });
  it('ends by returning a value', () => {
    const chained = new chain(i => i)
    assert.equal(chained(1), 1)
  });
  it('ends by returning a value from a key', () => {
    const chained = new chain({ a: () => 1 });
    assert.equal(chained.a, 1);
  });
  it('ends by returning a value from a chained function', () => {
    const chained = new chain({ a: () => i => i });
    assert.equal(chained.a(1), 1);
  });
});
