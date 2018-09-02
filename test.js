const chain = require('.');
const util = require('util');
const assert = require('assert');

describe('basic', () => {
  it('all', done => chain((...args) => {
    assert.deepEqual(args, ['ok']);
    done();
  }).ok);
  it('custom', done => chain({
    custom: (...args) => {
      assert.deepEqual(args, ['custom']);
      done();
    }
  }).custom);
  it('set', () => {
    const chained = chain(() => () => {});
    chained.a = 1;
    chained.b.b = 2;
    assert.deepEqual(chained, { a: 1, b: { b: 2 } });
  });
});

describe('opts', () => {
  it('base', () => {
    const chained = chain(() => {}, {}, { base: { a: 1 } });
    assert.equal(util.inspect(chained), '{ a: 1 }')
    assert.equal(util.inspect(chained.a), '1')
  });
  it('inherit', () => {
    const chained = chain(() => {}, {}, { base: { a: 1 }, inherit: false });
    assert.equal(util.inspect(chained), '{ a: 1 }')
    assert.equal(util.inspect(chained.a), '{ a: 1 }')
  });
});

describe('full', () => {
  it(`chain.a.b('c').d.e('f').g.custom('h').i('j').k`, () => {
    const all = [];
    const custom = [];
    const handle = handler => (...args) => {
      eval(handler).push(args);
      return (...args) => {
        eval(handler).push(args);
      }
    }
    const chained = chain(handle('all'), { custom: handle('custom') });

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
      ['custom', 'g', 'e', 'd', 'b', 'a'],
      ['h'],
    ]);
  });
  it('keyChain', done => {
    const chained = chain({
      'key.chain.a': (...args) => {
        // assert.deepEqual(args, )
        done();
      }
    });
    chained.key.chain.a
  });
  describe('regex', () => {
    it('map', done => {
      const chained = chain(new Map([
        [/a.*c/, (...args) => {
          assert.deepEqual(args, ['c', 'b', 'a']);
          done();
        }]
      ]));
      chained.a.b.c
    });
    it('object', done => {
      const chained = chain({
        '/a.*c/': (...args) => {
          assert.deepEqual(args, ['c', 'b', 'a']);
          done();
        }
      });
      chained.a.b.c
    });
  })
});

describe('misc', () => {
  it('class', done => {
    const chained = chain(() => {}, {}, {
      base: class {
        constructor(...args) {
          assert.deepEqual(args, []);
          done();
        }
      }
    });
    new chained();
  });
})
