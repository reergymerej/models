'use strict';

var will = require('willy').will,
  app = require('../app');

describe('sanity', function () {
  it('should be present', function () {
    will(app).exist();
  });
});

describe('defining a model', function () {
  it('should allow a model to be defined', function () {
    will(app.define('Foo')).exist();
  });
});

describe('instantiating a model', function () {
  var foo,
    Foo = app.define('Foo', {
      fields: {
        foo: true,
        bar: true
      }
    });

  before(function () {
    foo = new Foo();
  });

  it('should return an instance of the model', function () {
    will(foo).exist();
  });

  it('should have all fields set, even if they were not provided during instantiation', function () {
    will(foo.get()).have(['foo', 'bar']);
  });

  it('should return the value for a given field', function () {
    var foo = new Foo({
      bar: 99
    });

    will(foo.get('bar')).be(99);
  });
});
