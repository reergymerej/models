# Model (working title)

This is a library for creating models.  It is the M in MVC.


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
var Model = app.define('Model', {
  fields: {
    firstName: {
      type: app.STRING
    },
    lastName: {
      type: app.STRING
    },
    fullName: {
      type: app.STRING,
      value: function (fieldValues) {
        return fieldValues.firstName + ' ' + fieldValues.lastName;
      }
    }
  }
});

var model = new Model({ firstName: 'Jeremy', lastName: 'Greer' });

model.get('fullName'); // 'Jeremy Greer'
```

### ENUM Fields

```js
var Model = app.define('Model', {
  fields: {
    color: {
      type: app.ENUM,
      default: 'red',
      values: ['red', 'white', 'blue']
    }
  }
});

var model = new Model();

model.get('color');  // 'red'
model.set('color', 'purple');  // throws error
```

## Validation

```js
var Model = app.define('Model', {
  fields: {
    num: {
      type: app.NUMBER,
      valid: function (fieldValue) {
        return fieldValue > 3;
      }
    }
  }
});

var model = new Model();
model.valid(); // false

model = new Model({ num: 4 });
model.valid(); // true
```

## Observing Changes

```js
foo.on(app.CHANGE, function (values) {
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
