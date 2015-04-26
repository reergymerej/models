'use strict';

var define = function (name, config) {

  return function Constructor() {
    this.fields = config.fields;

    this.get = function (field) {
      var fieldValues = {},
        value;

      if (!field) {
        Object.keys(this.fields).forEach(function (key) {
          fieldValues[key] = this.fields[key];
        }, this);
      } else {
        value = this.fields[field];
      }

      return field ? value : fieldValues;
    };
  };
};

exports.define = define;