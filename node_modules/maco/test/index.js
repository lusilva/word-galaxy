var test = require('tap').test;
var maco = require('../index.js');

// just a stub for react
var FakeReact = {
  Component: function () {}
};

test('it can make components', function (t) {
  var Component = maco(componentFactory, FakeReact);
  var c = new Component();

  t.end();

  function componentFactory(x) {
    t.ok(x === this, 'component instance is passed to maco');
  }
});

test('it can bind to react', function(t) {
  var boundMaco = maco.bindToReact(FakeReact);
  var Component = boundMaco(componentFactory);
  var c = new Component();
  t.ok(c.constructor === FakeReact.Component, 'constructor is correct');

  t.end();

  function componentFactory(x) {
    t.ok(x === this, 'component instance is passed to maco');
  }
});

test('it expects factory to be a function', function(t) {
  try {
    var c = maco(42);
  } catch(e) {
    t.ok(e.message.indexOf('function') >= 0, 'factory is expected to be a function');
    t.end();
    return;
  }
  t.fail('It should throw on invalid argument');
});

test('it expects React', function(t) {
  try {
    var c = maco(function() {});
  } catch(e) {
    t.ok(e.message.indexOf('React') >= 0, 'React is expected');
    t.end();
    return;
  }
  t.fail('It should throw on invalid argument');
});
