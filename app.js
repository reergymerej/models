'use strict';

var BOOLEAN = 'boolean',
  NUMBER = 'number',
  STRING = 'string';

var Model = function () {};

Model.prototype.init = function (config) {
  var definitionConfig = this.constructor.prototype.config;
  this.fields = this.createFields(definitionConfig.fields, config);
  this.setInitialValues(config);

  this.setIdField(definitionConfig.idField);
};

// gets/sets id field value
// @param {*} [value] if present, sets value
// @return {*}
Model.prototype.id = function (value) {
  var id;
  if (this._idField) {
    if (arguments.length) {
      this.set(this._idField, value);
    }
    id = this.get(this._idField);
  }
  return id;
};

Model.prototype.setIdField = function (name) {
  this._idField = name;
};

// @param {Object} fieldConfigs
// @param {Object} fieldValues
// @return {Field[]}
Model.prototype.createFields = function (fieldConfigs, fieldValues) {
  var fields = [];

  fieldConfigs = fieldConfigs || {};

    Object.keys(fieldConfigs).forEach(function (fieldName) {
      fields.push(new Field(fieldName, fieldConfigs[fieldName]));
    });

    return fields;
};

Model.prototype.setInitialValues = function (fieldValues) {
  fieldValues = fieldValues || {};

  this.fields.forEach(function (field) {
    var value = field.getInitialValue(fieldValues[field.name]);
    this.set(field.name, value);
  }, this);
};

// get a field value
// @param {String} [fieldName]
// @return {*}
Model.prototype.get = function (fieldName) {
  var allValues,
    value,
    field;

  if (!fieldName) {
    allValues = {};
    this.fields.forEach(function (field) {
      allValues[field.name] = field.get();
    });
  } else {
    field = this.getField(fieldName);
    value = field && field.get();
  }

  return fieldName ? value : allValues;
};

Model.prototype.set = function (fieldName, value) {
  var field = this.getField(fieldName);
  if (field) {
    this[fieldName] = value;
    field.set(value);
  }
};

// @param {String} fieldName
// @return {Field}
Model.prototype.getField = function (fieldName) {
  var foundField;

  this.fields.every(function (field) {
    if (field.name === fieldName) {
      foundField = field;
    }
    return field.name !== fieldName;
  });

  return foundField;
};

var Field = function (name, config) {
  this.name = name;
  this.type = config.type;
  this.default = config.default;
};

Field.prototype.get = function () {
  return this.value;
};

Field.prototype.getInitialValue = function (value) {
  return value === undefined ? this.default : value;
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
      if (isNaN(value)) {
        value = 0;
      }
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
