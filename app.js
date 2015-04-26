'use strict';

var ModelConstructor = function (config) {
  this.fields = this.createFields(config.fields);
  // this.initValues(config);
};

// @param {Object} fieldConfigs
// @return {Field[]}
ModelConstructor.prototype.createFields = function (fieldConfigs) {
  var fields = [];

    Object.keys(fieldConfigs || {}).forEach(function (config) {
      fields.push(new Field(config));
    });

    return fields;
};

// get a field value
// @param {String} [fieldName]
// @return {*}
ModelConstructor.prototype.get = function (fieldName) {
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

var Field = function (config) {
  this.type = config.type;
};

Field.prototype.get = function () {
  return this.value;
};

var define = function (name, modelConfig) {
  return new ModelConstructor(modelConfig || {});
};

exports.define = define;