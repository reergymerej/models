'use strict';

var will = require('willy').will,
  app = require('../app');

describe('sanity', function () {
  it('should be present', function () {
    will(app).exist();
  });
});

describe('defining a model', function () {
  it('should return a constructor', function () {
    will(typeof app.define('Foo')).be('function');
  });
});

describe('instantiating a model', function () {
  var foo,
      Foo;

  before(function () {
    Foo = app.define('Foo', {
      fields: {
        foo: {
          type: app.BOOLEAN
        },
        bar: {
          type: app.STRING
        },
        baz: {
          type: app.STRING,
          default: 'the default baz'
        }
      }
    });
    foo = new Foo();
  });

  it('should return an instance of the model', function () {
    will(foo).beA(Foo);
  });

  it('should have all fields set, even if they were not provided during instantiation', function () {
    var keys = Object.keys(foo.get());
    will(keys).have(['foo', 'bar']);
  });

  it('should return the value for a given field', function () {
    var foo = new Foo({
      bar: 99
    });

    will(foo.get('bar')).be(99);
  });

  it('should return default value for a field if not specified during instantiation', function () {
    will(foo.get('baz')).be('the default baz');
  });
  
  describe('converting field values', function () {
    describe('type constants', function () {
      it('should provide constants to use for field type', function () {
        will(app).have(['BOOLEAN', 'STRING', 'NUMBER']);
      });
    });
  });
});
