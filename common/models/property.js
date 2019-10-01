'use strict';

module.exports = function (Property) {


  Property.activeProperty = function (id, callback) {
    Property.findById(id, function (err, property) {
      if (err) return callback(err)
      if (property == null) {
        return callback(Property.app.err.global.notFound())
      }
      if (property.status == 'active') {
        return callback(Property.app.err.global.alreadyActive())
      }
      property.updateAttribute("status", "active", function (err, newProperty) {
        if (err) return callback(err)
        return callback(null, newProperty);
      })
    })
  };


  Property.deactiveProperty = function (id, callback) {
    Property.findById(id, function (err, property) {
      if (err) return callback(err)
      if (property == null) {
        return callback(Property.app.err.global.notFound())
      }
      if (property.status == 'deactive') {
        return callback(Property.app.err.global.alreadyDeactive())
      }
      property.updateAttribute("status", "deactive", function (err, newProperty) {
        if (err) return callback(err)
        return callback(null, newProperty);
      })
    })
  };


  Property.getActiveProperty = function (filter, callback) {
    if (filter == null) {
      filter = {
        "where": {
          "status": "active"
        }
      }
    } else if (filter.where == null) {
      filter.where = {
        "status": "active"
      }
    } else {
      filter.where.status = "active"
    }

    Property.find(filter, function (err, data) {
      if (err) return callback(err)
      return callback(err, data)
    })
  };
};
