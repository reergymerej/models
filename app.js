'use strict';

var BOOLEAN = 'boolean',
  NUMBER = 'number',
  STRING = 'string';

var Model = function () {};

Model.prototype.init = function (config) {
  this.fields = this.createFields(this.constructor.prototype.config.fields, config);
};

// @param {Object} fieldConfigs
// @param {Object} fieldValues
// @return {Field[]}
Model.prototype.createFields = function (fieldConfigs, fieldValues) {
  var fields = [];

    Object.keys(fieldConfigs || {}).forEach(function (fieldName) {
      fields.push(new Field(fieldName, fieldConfigs[fieldName], fieldValues[fieldName]));
    });

    return fields;
};

// get a field value
// @param {String} [fieldName]
// @return {*}
Model.prototype.get = function (fieldName) {
  var allValues = {},
    value;

  if (!fieldName) {
    this.fields.forEach(function (field) {
      allValues[field.name] = field.get();
    });
  } else {
    this.fields.every(function (field) {
      if (field.name === fieldName) {
        value = field.get();
      }
      return field.name !== fieldName;
    });
  }

  return fieldName ? value : allValues;
};

var Field = function (name, config, value) {
  this.name = name;
  this.type = config.type;
  this.default = config.default;

  this.setInitialValue(value);
};

Field.prototype.get = function () {
  return this.value;
};

Field.prototype.setInitialValue = function (value) {
  if (value === undefined) {
    this.set(this.default);
  } else {
    this.set(value);
    this.value = value;
  }
};

Field.prototype.set = function (rawValue) {
  this.rawValue = rawValue;
  this.value = this.convertValue(rawValue);
};

Field.prototype.convertValue = function (rawValue) {
  var value;
  switch (this.type) {
    case BOOLEAN:
      value = !!rawValue;
      break;
    case STRING:
      value = '' + (rawValue || '');
      break;
    case NUMBER:
      value = +(rawValue || 0);
      break;
    default:
      value = rawValue;
  }

  return value;
};

// @param {Function} Parent
// @return {Function}
var extend = function (Parent) {
  function Constructor(config){
    if (typeof this.init === 'function') {
      this.init(config || {});
    }
  }
  Constructor.prototype = Parent.prototype;
  return Constructor;
};

var createModelConstructor = function (name, config) {
  var Constructor = extend(Model);

  Constructor.prototype.type = name;
  Constructor.prototype.config = config;

  return Constructor;
};

var define = function (name, modelConfig) {
  return createModelConstructor(name, modelConfig);
};

exports.define = define;
exports.BOOLEAN = BOOLEAN;
exports.STRING = STRING;
exports.NUMBER = NUMBER;
