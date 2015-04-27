# Model (working title)

This is a library for creating models.  It is the M in MVC.

================================================

* fields
  * shim missing
  * defaults
  * type conversion
  * dot access
  * id field

* computed fields

* validation
  * field
  * model

* dirty state
  * field
  * model

* static methods

* save routines

* shorthand definition
================================================

## Definition

var model = require('model');

Foo = model.define('Foo', {
  idField: 'name',
  fields: {
    name: {
      type: model.STRING
    },
    bar: {
      type: model.NUMBER,
      default: 42
    },
    baz: {
      type: model.BOOLEAN,
      default: true
    }
  }
});

var foo = new Foo({
  name: 'asdf',
  bar: 99
});

## Getting Field Values

foo.get('bar'); // 99
foo.get(); // { name: 'asdf', bar: 99, baz: true }