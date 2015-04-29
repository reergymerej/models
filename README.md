# Model [![Build Status](https://travis-ci.org/reergymerej/models.svg?branch=master)](https://travis-ci.org/reergymerej/models)

This is an unassuming library for creating JavaScript models.  It's the M of MVC.

## Definition

```js
var model = require('model');

var Foo = model.define('Foo', {
  idField: 'name',
  fields: {
    name: { type: model.STRING },
    bar: { type: model.NUMBER, default: 42 },
    baz: { type: model.BOOLEAN, default: true }
  }
});

var foo = new Foo({ name: 'asdf', bar: 99 });
```

## Getting Field Values

```js
foo.get(); // { name: 'asdf', bar: 99, baz: true }
foo.get('bar'); // 99
foo.id(); // 'asdf'
```

## Setting Field Values

```js
foo.id('new id');
foo.id(); // 'new id'

foo.set('bar', 123);
foo.get('bar'); // 123

foo.set({
    name: 'dude',
    bar: 3.14,
    baz: false
})
foo.get(); // { name: 'dude', bar: 3.14, baz: false }
```

### Computed Fields

```js
var Foo = models.define('Foo', {
  fields: {
    firstName: {
      type: models.STRING
    },
    lastName: {
      type: models.STRING
    },
    fullName: {
      type: models.STRING,
      value: function (fieldValues) {
        return fieldValues.firstName + ' ' + fieldValues.lastName;
      }
    }
  }
});

var foo = new Foo({ firstName: 'Jeremy', lastName: 'Greer' });

foo.get('fullName'); // 'Jeremy Greer'
```

### ENUM Fields

```js
var Foo = models.define('Foo', {
  fields: {
    color: {
      type: models.ENUM,
      default: 'red',
      values: ['red', 'white', 'blue']
    }
  }
});

var foo = new Foo();

foo.get('color');  // 'red'
foo.set('color', 'purple');  // throws error
```

## Validation

```js
var Foo = models.define('Foo', {
  fields: {
    num: {
      type: models.NUMBER,
      valid: function (fieldValue) {
        return fieldValue > 3;
      }
    }
  }
});

var foo = new Foo();
foo.valid(); // false

foo = new Foo({ num: 4 });
foo.valid(); // true
```

## Observing Changes

```js
foo.on(models.CHANGE, function (values) {
  console.log(values);  // { name: 'new name', number: 8675309 }
});

foo.set({ name: 'new name', number: 8675309 });
foo.set({ name: 'new name' });  // won't fire handler because nothing changed
```

## Check Dirty State

```js
foo = new Foo({ name: 'a foo', bar: 66 });
foo.dirty(); // undefined

foo.set({ name: 'new name' });
foo.dirty(); // { name: 'new name' }

foo.set({ bar: 77 });
foo.dirty(); // { name: 'new name', bar: 77 }
```

================================================

### Coming Soon

* static methods
* save routines
* shorthand definition
* nested models
