'use strict';

var will = require('willy').will,
  sledom = require('../app');

describe('sanity', function () {
  it('should be present', function () {
    will(sledom).exist();
  });
});

describe('defining a model', function () {
  it('should return a constructor', function () {
    will(typeof sledom.define('Foo')).be('function');
  });

  describe('id field', function () {
    var Model;

    before(function () {
      Model = sledom.define('Model', {
        idField: 'foo',
        fields: {
          foo: {
            type: sledom.STRING
          },
          bar: {
            type: sledom.NUMBER
          }
        }
      });
    });

    it('should allow for identifying a field to be used as the id field', function () {
      var model = new Model({ foo: 'asdf' });
      will(model.id()).be('asdf');
    });

    it('should set the id field by "id"', function () {
      var model = new Model({ foo: 'asdf' });
      model.id('new id');
      will(model.id()).be('new id');
    });
  });
});

describe('instantiating a model', function () {
  var foo,
      Foo;

  before(function () {
    Foo = sledom.define('Foo', {
      fields: {
        foo: {
          type: sledom.BOOLEAN
        },
        bar: {
          type: sledom.STRING
        },
        baz: {
          type: sledom.STRING,
          default: 'the default baz'
        },
        quux: {
          type: sledom.NUMBER
        },
        numAsString: {
          type: sledom.STRING,
          default: '123'
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
      bar: 'some string'
    });

    will(foo.get('bar')).be('some string');
  });

  it('should return default value for a field if not specified during instantiation', function () {
    will(foo.get('baz')).be('the default baz');
  });

  describe('converting field values', function () {
    describe('type constants', function () {
      it('should provide constants to use for field type', function () {
        will(sledom).have(['BOOLEAN', 'STRING', 'NUMBER']);
      });
    });

    it('should convert STRING', function () {
      will(foo.get('bar')).be('');
    });

    it('should convert BOOLEAN', function () {
      will(foo.get('foo')).be(false);
    });

    it('should convert NUMBER', function () {
      will(foo.get('quux')).be(0);
    });

    it('should convert default values according to type', function () {
      will(foo.get('numAsString')).be('123');
    });

    it('should convert values according to type', function () {
      var foo = new Foo({
        numAsString: 666,
      });
      will(foo.get('numAsString')).be('666');
    });

    it('should handle NaN', function () {
      var foo = new Foo({
        quux: 'asdf',
      });
      will(foo.get('quux')).beA(Number);
    });
  });
});

describe('getting values', function () {
  it('should return values with "get"', function () {
    var Model = sledom.define('Model', {
      fields: {
        foo: { type: sledom.STRING }
      }
    });
    var model = new Model({ foo: 'asdf' });

    will(model.get('foo')).be('asdf');
  });

  it('should provide access to the field values like a pojo', function () {
    var Model = sledom.define('Model', {
      fields: {
        foo: { type: sledom.STRING }
      }
    });
    var model = new Model({ foo: 'asdf' });

    model.set('foo', 'what?');

    will(model.foo).be('what?');
  });

  it('should provide access to the field values like a pojo even for initial values', function () {
    var Model = sledom.define('Model', {
      fields: {
        foo: { type: sledom.STRING }
      }
    });
    var model = new Model({ foo: 'asdf' });

    will(model.foo).be('asdf');
  });
});

describe('setting values', function () {
  var model;

  before(function () {
    var Model = sledom.define('Model', {
      fields: {
        foo: { type: sledom.STRING },
        bar: { type: sledom.STRING },
        baz: { type: sledom.NUMBER },
      }
    });
    model = new Model();
  });

  it('should set multiple fields with an object', function () {

    model.set({
      foo: 'the foo',
      bar: 'the bar',
      baz: '111'
    });

    var values = model.get();

    will(values.foo).be('the foo');
    will(values.bar).be('the bar');
    will(values.baz).be(111);
  });

  it('should return a hash of the new values', function () {
    var newVals = { foo: 'new foo', bar: 'new bar' },
      changes = model.set(newVals);

    will(changes).beLike(newVals);
  });
});

describe('computed fields', function () {
  it('should allow for computed field values by a function', function () {
    var Model = sledom.define('Model', {
      fields: {
        firstName: {
          type: sledom.STRING
        },
        lastName: {
          type: sledom.STRING
        },
        fullName: {
          type: sledom.STRING,
          value: function (fieldValues) {
            return fieldValues.firstName + ' ' + fieldValues.lastName;
          }
        }
      }
    });

    var model = new Model({ firstName: 'Jeremy', lastName: 'Greer' });

    will(model.get('fullName')).be('Jeremy Greer');
  });
});

describe('validation', function () {
  var Model;

  before(function () {
    Model = sledom.define('Model', {
      idField: 'num',
      fields: {
        num: {
          type: sledom.NUMBER,
          valid: function (value) {
            return value > 3;
          }
        }
      }
    });
  });

  it('should allow for field-level validation', function () {
    var model = new Model();
    will(model.valid()).be(false);
  });

  it('should return true if validation is not falsy', function () {
    var model = new Model({ num: 4 });
    will(model.valid()).be(true);
  });

  it('should return true for models with no validation rules', function () {
    var Model = sledom.define('Model', {
      fields: {
        name: {
          type: sledom.STRING,
          default: 'hello'
        }
      }
    });
    var model = new Model();

    will(model.valid()).be(true);
  });
});

describe('change events', function () {
  var model, Model;

  before(function () {
    Model = sledom.define('Model', {
      idField: 'id',
      fields: {
        name: {
          type: sledom.STRING,
          default: 'John Doe'
        },

        number: {
          type: sledom.NUMBER
        },

        isDead: {
          type: sledom.BOOLEAN,
          default: false
        }
      }
    });
  });

  beforeEach(function () {
    model = new Model();
  });

  it('should execute a handler when a field changes', function (done) {
    model.on(sledom.CHANGE, function () {
      done();
    });

    model.set('number', 99);
  });

  it('should pass the new values', function (done) {
    model.on(sledom.CHANGE, function (changes) {
      will(changes).beLike({ number: 99 });
      done();
    });

    model.set('number', 99);
  });

  it('should not fire when the field did not change', function (done) {
    model.on(sledom.CHANGE, function (changes) {
      will(changes).not.be('name');
      done();
    });

    model.set('name', model.get('name'));
    done();
  });

  it('should allow unbinding of events', function () {
    var handlerCalled = false;
    var onChange = function () {
      handlerCalled = true;
    };
    model.on(sledom.CHANGE, onChange);
    model.off(sledom.CHANGE, onChange);
    model.set('name', 'new name');

    will(handlerCalled).be(false);
  });

  it('should only unbind when event type and handler match', function () {
    var handlerCalled = false;
    var onChange = function () {};
    var onChange2 = function () {
      handlerCalled = true;
    };

    model.on(sledom.CHANGE, onChange);
    model.on(sledom.CHANGE, onChange2);
    model.off(sledom.CHANGE, onChange);
    model.set('name', 'new name');

    will(handlerCalled).be(true);
  });

  it('should unbind all handlers when not specified', function () {
    var handlerCalled = false;
    var onChange = function () {
      handlerCalled = true;
    };
    var onChange2 = function () {
      handlerCalled = true;
    };

    model.on(sledom.CHANGE, onChange);
    model.on(sledom.CHANGE, onChange2);
    model.off(sledom.CHANGE);
    model.set('name', 'new name');

    will(handlerCalled).be(false);
  });

  it('should have aliases for the bind method', function () {
    will(model.on).be(model.bind);
  });

  it('should have aliases for the unbind method', function () {
    will(model.off).be(model.unbind);
  });
});

describe('enum fields', function () {
  var Model;

  before(function () {
    Model = sledom.define('Model', {
      fields: {
        color: {
          type: sledom.ENUM,
          default: 'red',
          values: ['red', 'white', 'blue']
        }
      }
    });
  });

  it('should throw when setting to invalid value', function () {
    var model = new Model();

    will(function () {
      model.set('color', 'purple');
    }).throw();
  });
});

describe('dirty state', function () {
  var model;

  beforeEach(function () {
    var Model = sledom.define('Model', {
      fields: {
        foo: { type: sledom.STRING },
        bar: { type: sledom.NUMBER },
        baz: { type: sledom.NUMBER },
      }
    });
    model = new Model({
      foo: 'asdf',
      bar: 123,
      baz: 999
    });
  });

  it('should not be dirty at first', function () {
    will(model.dirty()).beFalsy();
  });

  it('should be dirty after a field has been changed', function () {
    model.set('foo', 'eee');
    will(model.dirty()).beLike({ foo: 'eee' });
  });

  it('should not be dirty if nothing has been changed', function () {
    model.set('foo', model.get('foo'));
    will(model.dirty()).beFalsy();
  });
});

describe('instance methods', function () {
  var Model;

  before(function () {
    Model = sledom.define('Model', {
      fields: {
        number: { type: sledom.NUMBER }
      },

      // instance method
      getNumber: function () {
        return 'The number is ' + this.get('number');
      }
    });
  });

  it('should work from instances', function () {
    var model = new Model({ number: 999 });
    will(model.getNumber()).be('The number is ' + 999);
  });
});

describe('custom field types', function () {
  it('should convert raw values into specified type', function () {
    function Foo() {}
    Foo.prototype.proveFooness = function () {
      return 'I am a Foo.';
    };

    var Model = sledom.define('Model', {
      fields: {
        foo: { type: Foo }
      }
    });

    var model = new Model();

    will(model.get('foo').proveFooness()).be('I am a Foo.');
  });
});

describe('nested models', function () {
  it('should support nested models', function () {
    var Person = sledom.define('Person', {
      fields: {
        name: { type: sledom.STRING },
        gender: { type: sledom.ENUM, values: ['male', 'female' ] }
      }
    });

    var Child = sledom.define('Child', {
      fields: {
        name: { type: sledom.STRING },
        parent: { type: Person }
      }
    });

    var dad = new Person({ name: 'Dad', gender: 'male' });
    var daughter = new Child({ name: 'Daughter', parent: dad });

    will(daughter.get('parent')).beA(Person);
  });

  // TODO:
  // it('should handle changes on inner models', function () {

  // });
});