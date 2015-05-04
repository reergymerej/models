'use strict';

var rednib = require('rednib');

var VERSION = '0.1.2',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  STRING = 'string',
  ENUM = 'enum',
  CHANGE = 'change',
  CUSTOM = 'custom',
  GENERIC = 'generic',
  MODEL = 'model';

var Model = function () {};

rednib.alias('bind', 'on');
rednib.alias('unbind', 'off');
rednib(Model.prototype);

Model.prototype._init = function (instanceConfig) {
  var classConfig = this.constructor.prototype.config;
  this._fields = this._createFields(classConfig.fields, instanceConfig);
  this._setInitialValues(instanceConfig);
  this._setIdField(classConfig.idField);
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
    this._dirty = null;
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

// ================================================
// Model public

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
    if (valid && typeof field.valid === 'function') {
      valid = !!(field.valid(field.get()));
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
  var setValues,
    newValues;

  if (arguments.length === 1) {
    setValues = fieldName;
  } else {
    setValues = {};
    setValues[fieldName] = value;
  }

  Object.keys(setValues).forEach(function (fieldName) {
    var field = this._getField(fieldName),
      value = setValues[fieldName],
      processedValue;

    if (field) {
      this[fieldName] = value;  // raw value

      newValues = newValues || {};
      processedValue = field.set(value);
      if (processedValue !== undefined) {
        newValues[fieldName] = processedValue;
      }
    }
  }, this);

  this._dirty = this._dirty || {};
  (Object.keys(newValues) || []).forEach(function (fieldName) {
    this._dirty[fieldName] = newValues[fieldName];
  }, this);

  if (Object.keys(newValues).length) {
    this.trigger(CHANGE, newValues);
  }

  return newValues;
};

Model.prototype.dirty = function () {
  return Object.keys(this._dirty || {}).length ? this._dirty : undefined;
};

// ================================================
var Field = function (name, config, model) {
  this.name = name;
  this.setType(config);
  this.default = config.default;
  this.valueFn = config.value;
  this.model = model;
  this.valid = config.valid;
  this.values = config.values;
};

Field.prototype.setType = function (config) {
  if (!config.type) {
    this.type = GENERIC;
  } else if (typeof config.type === 'function') {
    if (config.type.prototype.sledom) {
      this.type = MODEL;
    } else {
      this.type = CUSTOM;
    }

    this.FieldConstructor = config.type;
  } else {
    this.type = config.type;
  }
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

// return {*}
Field.prototype.set = function (rawValue) {
  var lastVal = this.value;

  if (this.type === ENUM) {
    if ((this.values || []).indexOf(rawValue) === -1) {
      throw new Error(rawValue + ' is not one of the enums: ' + (this.values || []).join(', '));
    }
  }

  this.rawValue = rawValue;
  this.value = this.convertValue(rawValue);

  return this.value !== lastVal ? this.value : undefined;
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
    case CUSTOM:
      value = new this.FieldConstructor(rawValue);
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

  Constructor.prototype.sledom = true;
  Constructor.prototype.type = name;
  Constructor.prototype.config = config;

  var setInstanceMethods = function (config, Constructor) {
    Object.keys(config || {}).forEach(function (field) {
      if (typeof config[field] === 'function') {
        Constructor.prototype[field] = config[field];
      }
    });
  };

  setInstanceMethods(config, Constructor);

  return Constructor;
};

var define = function (name, modelConfig) {
  return createModelConstructor(name, modelConfig);
};

exports.VERSION = VERSION;
exports.define = define;
exports.BOOLEAN = BOOLEAN;
exports.STRING = STRING;
exports.NUMBER = NUMBER;
exports.ENUM = ENUM;
exports.CHANGE = CHANGE;
