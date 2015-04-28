'use strict';

var BOOLEAN = 'boolean',
  NUMBER = 'number',
  STRING = 'string',
  ENUM = 'enum';

var Model = function () {};

Model.prototype._init = function (config) {
  var definitionConfig = this.constructor.prototype.config;
  this._fields = this._createFields(definitionConfig.fields, config);
  this._setInitialValues(config);
  this._setIdField(definitionConfig.idField);
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

Model.prototype._setIdField = function (name) {
  this._idField = name;
};

// @param {Object} fieldConfigs
// @param {Object} fieldValues
// @return {Field[]}
Model.prototype._createFields = function (fieldConfigs, fieldValues) {
  var fields = [];

  fieldConfigs = fieldConfigs || {};

    Object.keys(fieldConfigs).forEach(function (fieldName) {
      fields.push(new Field(fieldName, fieldConfigs[fieldName], this));
    }, this);

    return fields;
};

Model.prototype._setInitialValues = function (fieldValues) {
  fieldValues = fieldValues || {};

  this._fields.forEach(function (field) {
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
    this._fields.forEach(function (field) {
      allValues[field.name] = field.get();
    });
  } else {
    field = this._getField(fieldName);
    value = field && field.get();
  }

  return fieldName ? value : allValues;
};

Model.prototype.valid = function () {
  var valid = true;

  this._fields.forEach(function (field) {
    if (valid) {
      valid = !!(field.valid && field.valid(field.get()));
    }
  });

  return valid;
};

Model.prototype._getNonComputedFields = function () {
  var fields = [];

  this._fields.forEach(function (field) {
    if (field.valueFn === undefined) {
      fields.push(field);
    }
  });

  return fields;
};

Model.prototype._getNonComputedFieldValues = function () {
  var values = {};

  this._getNonComputedFields().forEach(function (field) {
    values[field.name] = field.get();
  });

  return values;
};

// @param {String/Object} fieldName
// @param {*} [value]
Model.prototype.set = function (fieldName, value) {
  var values;

  if (arguments.length === 1) {
    values = fieldName;
  } else {
    values = {};
    values[fieldName] = value;
  }

  Object.keys(values).forEach(function (fieldName) {
    var field = this._getField(fieldName),
      value = values[fieldName];
    if (field) {
      this[fieldName] = value;
      field.set(value);
    }
  }, this);
};

// @param {String} fieldName
// @return {Field}
Model.prototype._getField = function (fieldName) {
  var foundField;

  this._fields.every(function (field) {
    if (field.name === fieldName) {
      foundField = field;
    }
    return field.name !== fieldName;
  });

  return foundField;
};

var Field = function (name, config, model) {
  this.name = name;
  this.type = config.type;
  this.default = config.default;
  this.valueFn = config.value;
  this.model = model;
  this.valid = config.valid;
  this.values = config.values;
};

Field.prototype.get = function () {
  var value;

  if (this.valueFn) {
    value = this.valueFn(this.model._getNonComputedFieldValues());
  } else {
    value = this.value;
  }

  return value;
};

Field.prototype.getInitialValue = function (value) {
  return value === undefined ? this.default : value;
};

Field.prototype.set = function (rawValue) {

  if (this.type === ENUM) {
    if ((this.values || []).indexOf(rawValue) === -1) {
      throw new Error(rawValue + ' is not one of the enums: ' + (this.values || []).join(', '));
    }
  }

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
    if (typeof this._init === 'function') {
      this._init(config || {});
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
exports.ENUM = ENUM;
