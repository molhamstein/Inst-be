'use strict';

module.exports = function (Subcategory) {

  
  Subcategory.validatesInclusionOf('status', {
    in: ['active', 'deactive']
  });


  Subcategory.activeSubcategory = function (id, callback) {
    Subcategory.findById(id, function (err, cubcategory) {
      if (err) return callback(err)
      if (cubcategory == null) {
        return callback(Subcategory.app.err.global.notFound())
      }
      if (cubcategory.status == 'active') {
        return callback(Subcategory.app.err.global.alreadyActive())
      }
      cubcategory.updateAttribute("status", "active", function (err, newSubcategory) {
        if (err) return callback(err)
        return callback(null, newSubcategory);
      })
    })
  };


  Subcategory.deactiveSubcategory = function (id, callback) {
    Subcategory.findById(id, function (err, cubcategory) {
      if (err) return callback(err)
      if (cubcategory == null) {
        return callback(Subcategory.app.err.global.notFound())
      }
      if (cubcategory.status == 'deactive') {
        return callback(Subcategory.app.err.global.alreadyDeactive())
      }
      cubcategory.updateAttribute("status", "deactive", function (err, newSubcategory) {
        if (err) return callback(err)
        return callback(null, newSubcategory);
      })
    })
  };


  Subcategory.getActiveSubcategoryBySubject = async function (subjectId, filter, callback) {
    try {
      const Subject = Subcategory.app.models.Subject
      var sub = await Subject.checkSubject(subjectId)
      if (filter == null) {
        filter = {
          "where": {
            "status": "active",
            "subjectId": subjectId
          }
        }
      } else if (filter.where == null) {
        filter.where = {
          "status": "active",
          "subjectId": subjectId
        }
      } else {
        filter.where.status = "active"
        filter.where.subjectId = subjectId
      }
      var subcategories = await Subcategory.find(filter)
      return subcategories
    } catch (error) {
      return callback(error)
    }
  };


  Subcategory.checkSubcategory = function (id) {
    return new Promise(function (resolve, reject) {
      Subcategory.findById(id, function (err, subcategory) {
        if (err) reject(err)
        if (subcategory == null || subcategory.status == 'deactive')
          reject(Subcategory.app.err.global.notFound())
        resolve(subcategory)
      })
    })
  }


  Subcategory.getActiveSubcategoryBySubcategory = async function (subcategoryId, filter, callback) {
    try {
      var subcategory = await Subcategory.checkSubcategory(subcategoryId)
      if (filter == null) {
        filter = {
          "where": {
            "status": "active",
            "subcategoryId": subcategoryId
          }
        }
      } else if (filter.where == null) {
        filter.where = {
          "status": "active",
          "subcategoryId": subcategoryId
        }
      } else {
        filter.where.status = "active"
        filter.where.subcategoryId = subcategoryId
      }
      var subcategories = await Subcategory.find(filter)
      return subcategories
    } catch (error) {
      return callback(error)
    }
  };


};
