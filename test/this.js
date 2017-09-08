describe('this', () => {
  it('...', () => {
    // const handler = td.function();
    // let ctr = 0;
    const chained = new chain(function(prop) {
      // console.log(`prop:`, prop);
      // console.log(`this:`, this);
      this.aaa = true;
    });
    // console.log(`chained.a.b:`, chained.a.b);
    // console.log(`chained.aaa:`, chained.aaa);
  });
});
