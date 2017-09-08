const chain = require('.');
const td = require('testdouble');
const assert = require('assert');

describe.only('basic', () => {
  it('allOK', done => chain(ok => done(assert.equal(ok, 'ok'))).ok);
  it('customOK', done => chain({ done }).done);

  it('full', () => {
    const all = td.function();
    const allFn = td.function();
    const custom = td.function();
    const customFn = td.function();

    td.when(all(td.matchers.anything())).thenReturn(allFn);
    td.when(custom()).thenReturn(customFn);

    const chained = chain(all, { custom });

    // chained.a;
    chained.a.b('c').d.e('f').g.custom('h');

    // td.verify(all('a'));
    // td.verify(all('b'));
    td.verify(allFn('c'));
    // td.verify(all('d'));
    // td.verify(all('e'));
    td.verify(allFn('f'));
    // td.verify(all('g'));
    // td.verify(custom());
    td.verify(customFn('h'));
  });
});
