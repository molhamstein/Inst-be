'use strict';

module.exports = function (Category) {

  
  Category.validatesInclusionOf('status', {
    in: ['active', 'deactive']
  });

  Category.getActiveCategory = function (filter, callback) {
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

    Category.find(filter, function (err, data) {
      if (err) return callback(err)
      return callback(err, data)
    })
  };


  Category.activeCategory = function (id, callback) {
    Category.findById(id, function (err, category) {
      if (err) return callback(err)
      if (category == null) {
        return callback(Category.app.err.global.notFound())
      }
      if (category.status == 'active') {
        return callback(Category.app.err.global.alreadyActive())
      }
      category.updateAttribute("status", "active", function (err, newCategory) {
        if (err) return callback(err)
        return callback(null, newCategory);
      })
    })
  };


  Category.deactiveCategory = function (id, callback) {
    Category.findById(id, function (err, category) {
      if (err) return callback(err)
      if (category == null) {
        return callback(Category.app.err.global.notFound())
      }
      if (category.status == 'deactive') {
        return callback(Category.app.err.global.alreadyDeactive())
      }
      category.updateAttribute("status", "deactive", function (err, newCategory) {
        if (err) return callback(err)
        return callback(null, newCategory);
      })
    })
  };



  Category.checkCategory = function (id) {
    return new Promise(function (resolve, reject) {
      Category.findById(id, function (err, category) {
        if (err) reject(err)
        if (category == null || category.status == 'deactive')
          reject(Category.app.err.global.notFound())
        resolve(category)
      })
    })
  }
};
