const chain = require('.');
const assert = require('assert');

describe('basic', () => {
  it('all', done => chain(ok => done(assert.equal(ok, 'ok'))).ok);
  it('custom', done => chain({ done: () => done() }).done);
});

describe('full', () => {
  it(`chain.a.b('c').d.e('f').g.custom('h').i('j').k`, () => {
    const all = [];
    const custom = [];
    const chained = chain((...args) => {
      all.push(args);
      return (...args) => {
        all.push(args);
      };
    }, {
      custom: (...args) => {
        custom.push(args);
        return (...args) => {
          custom.push(args);
        };
      }
    });

    chained.a.b('c').d.e('f').g.custom('h').i('j').k;

    assert.deepEqual(all, [
      ['a'],
      ['b', 'a'],
      ['c'],
      ['d', 'b', 'a'],
      ['e', 'd', 'b', 'a'],
      ['f'],
      ['g', 'e', 'd', 'b', 'a'],
      ['i', 'custom', 'g', 'e', 'd', 'b', 'a'],
      ['j'],
      ['k', 'i', 'custom', 'g', 'e', 'd', 'b', 'a'],
    ]);

    assert.deepEqual(custom, [
      ['g', 'e', 'd', 'b', 'a'],
      ['h'],
    ]);
  });
});
