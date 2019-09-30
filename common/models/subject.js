'use strict';

module.exports = function (Subject) {


  Subject.validatesInclusionOf('status', {
    in: ['active', 'deactive']
  });


  Subject.activeSubject = function (id, callback) {
    Subject.findById(id, function (err, subject) {
      if (err) return callback(err)
      if (subject == null) {
        return callback(Subject.app.err.global.notFound())
      }
      if (subject.status == 'active') {
        return callback(Subject.app.err.global.alreadyActive())
      }
      subject.updateAttribute("status", "active", function (err, newSubject) {
        if (err) return callback(err)
        return callback(null, newSubject);
      })
    })
  };


  Subject.deactiveSubject = function (id, callback) {
    Subject.findById(id, function (err, subject) {
      if (err) return callback(err)
      if (subject == null) {
        return callback(Subject.app.err.global.notFound())
      }
      if (subject.status == 'deactive') {
        return callback(Subject.app.err.global.alreadyDeactive())
      }
      subject.updateAttribute("status", "deactive", function (err, newSubject) {
        if (err) return callback(err)
        return callback(null, newSubject);
      })
    })
  };


  Subject.getActiveSubjectByCategory = async (categoryId, filter, callback) => {
    try {
      const Category = Subject.app.models.Category
      var cat = await Category.checkCategory(categoryId)
      if (filter == null) {
        filter = {
          "where": {
            "status": "active",
            "categoryId": categoryId
          }
        }
      } else if (filter.where == null) {
        filter.where = {
          "status": "active",
          "categoryId": categoryId
        }
      } else {
        filter.where.status = "active"
        filter.where.categoryId = categoryId
      }
      var subjects = await Subject.find(filter)
      return subjects
    } catch (error) {
      callback(error)
    }
  };


  Subject.checkSubject = function (id) {
    return new Promise(function (resolve, reject) {
      Subject.findById(id, function (err, subject) {
        if (err) reject(err)
        if (subject == null || subject.status == 'deactive')
          reject(Subject.app.err.global.notFound())
        resolve(subject)
      })
    })
  }

};
