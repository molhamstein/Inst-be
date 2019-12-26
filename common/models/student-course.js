'use strict';
var async = require("async");

module.exports = function (Studentcourse) {


  Studentcourse.addStudentToCourse = async function (courseId, studentId, order, req, callback) {
    try {
      var mainCourse = await Studentcourse.app.models.Course.findById(courseId)
      if (mainCourse == null)
        throw Studentcourse.app.err.notFound.courseNotFound()

      var oldStudentcourse = await Studentcourse.findOne({
        "where": {
          "courseId": courseId,
          "studentId": studentId
        }
      })
      if (oldStudentcourse != null) {
        throw Studentcourse.app.err.course.studentAlreadyInCourse()
      }
      await Studentcourse.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      await Studentcourse.app.dataSources.mainDB.transaction(async models => {
        const {
          course
        } = models
        const {
          studentCourse
        } = models

        var newStudentcourse = await studentCourse.create({
          "courseId": courseId,
          "studentId": studentId,
          "order": order,
          "isInQueue": true
        })
        var oldCourse = await course.findById(courseId)
        var newCountStudentInQueue = oldCourse.countStudentInQueue + 1
        var newCourse = await oldCourse.updateAttribute("countStudentInQueue", newCountStudentInQueue)

        callback(null, newCourse)
      })
    } catch (error) {
      callback(error)
    }
  };


  Studentcourse.addStudentToCourses = function (studentId, coursesId) {
    return new Promise(function (resolve, reject) {
      async.forEachOf(coursesId, function (element, index, callback) {
        addStudentToOneCourse(studentId, element, function (err) {
          if (err) reject(err)
          callback()
        })
      }, function () {
        console.log("Finish loop")
        resolve()
      })
    })
  }

  function addStudentToOneCourse(studentId, courseId, callback) {
    Studentcourse.app.models.session.find({
      "where": {
        "courseId": courseId
      }
    }, function (err, sessions) {
      if (err) return callback(err)
      Studentcourse.app.models.Course.findById(courseId, function (err, oneCourse) {
        if (err) return callback(err)
        var cost;
        if (oneCourse.typeCost == "course")
          cost = oneCourse.cost
        Studentcourse.create({
          "courseId": courseId,
          "studentId": studentId,
          "isInQueue": false,
          "cost": cost
        }, function (err, data) {
          if (err) return callback(err)
          var count = oneCourse.countStudent + 1
          oneCourse.updateAttribute("countStudent", count, function (err, newCourse) {
            if (err) return callback(err);
            async.forEachOf(sessions, function (element, index, seccallback) {
              Studentcourse.app.models.studentSession.create({
                "sessionId": element.id,
                "studentId": studentId,
                "cost": element.cost
              }, function (err, newSession) {
                if (err) return callback(err)
                seccallback()
              })
            }, function () {
              console.log("Finish loop")
              callback()
            })
          })
        })
      })
    })
  }


  Studentcourse.cheackStudentInCourses = function (studentId, coursesId) {
    return new Promise(function (resolve, reject) {
      var courseHasError = []
      async.forEachOf(coursesId, function (element, index, callback) {
        cheackStudentInOneCourses(studentId, element, function (err, data) {
          if (err) reject(err)
          if (data) {
            courseHasError.push({
              "courseId": element
            })
          }
          callback()
        })
      }, function () {
        console.log("Finish loop")
        resolve(courseHasError)
      })
    })
  }


  function cheackStudentInOneCourses(studentId, courseId, callback) {
    Studentcourse.findOne({
      "where": {
        "courseId": courseId,
        "studentId": studentId
      }
    }, function (err, data) {
      if (err) return callback(err)
      callback(null, data);
    })
  }


  Studentcourse.submitStudentCourseInNewPackage = async function (id, data, req, callback) {
    try {
      var mainStudentcourse = await Studentcourse.findById(id)
      if (mainStudentcourse == null) {
        throw Studentcourse.app.err.global.notFound()
      }
      var mainCourse = mainStudentcourse.course()
      await Studentcourse.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      if (mainStudentcourse.isInQueue == false) {
        throw Studentcourse.app.err.course.studentNotInQueue()
      }
      if (mainCourse.maxCountStudent < mainCourse.countStudent + 1) {
        throw Studentcourse.app.err.course.multiCourseIsFull([{
          "courseId": mainCourse.id
        }])
      }
      await Studentcourse.app.dataSources.mainDB.transaction(async models => {
        const {
          course
        } = models
        const {
          studentCourse
        } = models
        const {
          packageStudent
        } = models
        const {
          packageCourse
        } = models
        const {
          session
        } = models
        const {
          studentSession
        } = models
        data.studentId = mainStudentcourse.studentId;
        var newPackage = await packageStudent.create(data)
        await packageCourse.create({
          "courseId": mainCourse.id,
          "packageId": newPackage.id
        })
        var oldCourse = await course.findById(mainCourse.id)
        var inQueueCount = oldCourse.countStudentInQueue - 1
        var countStudent = oldCourse.countStudent + 1
        var newCours = await oldCourse.updateAttributes({
          "countStudentInQueue": inQueueCount,
          "countStudent": countStudent
        })
        var oldStudentCourse = await studentCourse.findById(id);
        var newStudentCourse = await oldStudentCourse.updateAttributes({
          "isInQueue": false,
          "order": null
        })
        var sessionCourse = await session.find({
          "where": {
            "courseId": newCours.id
          }
        })
        var studentSessionData = []
        sessionCourse.forEach(element => {
          studentSessionData.push({
            "sessionId": element.id,
            "studentId": mainStudentcourse.studentId
          })
        });
        await studentSession.create(studentSessionData)
        callback(null, newCours)
      })
    } catch (error) {
      callback(error)
    }
  };

  Studentcourse.submitStudentCourseInOldPackage = async function (id, packageId, newCost, req, callback) {
    try {
      var mainStudentcourse = await Studentcourse.findById(id)
      if (mainStudentcourse == null) {
        throw Studentcourse.app.err.global.notFound()
      }
      var mainCourse = mainStudentcourse.course()
      await Studentcourse.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      if (mainStudentcourse.isInQueue == false) {
        throw Studentcourse.app.err.course.studentNotInQueue()
      }
      if (mainCourse.maxCountStudent < mainCourse.countStudent + 1) {
        throw Studentcourse.app.err.course.multiCourseIsFull([{
          "courseId": mainCourse.id
        }])
      }
      await Studentcourse.app.dataSources.mainDB.transaction(async models => {
        const {
          course
        } = models
        const {
          studentCourse
        } = models
        const {
          packageStudent
        } = models
        const {
          packageCourse
        } = models
        const {
          session
        } = models
        const {
          studentSession
        } = models
        var oldPackage = await packageStudent.findById(packageId)
        if (oldPackage == null) {
          throw Studentcourse.app.err.global.notFound()
        }
        var newPackage = await oldPackage.updateAttribute("cost", newCost)
        await packageCourse.create({
          "courseId": mainCourse.id,
          "packageId": newPackage.id
        })
        var oldCourse = await course.findById(mainCourse.id)
        var inQueueCount = oldCourse.countStudentInQueue - 1
        var countStudent = oldCourse.countStudent + 1
        var newCours = await oldCourse.updateAttributes({
          "countStudentInQueue": inQueueCount,
          "countStudent": countStudent
        })
        var oldStudentCourse = await studentCourse.findById(id);
        var newStudentCourse = await oldStudentCourse.updateAttributes({
          "isInQueue": false,
          "order": null
        })
        var sessionCourse = await session.find({
          "where": {
            "courseId": newCours.id
          }
        })
        var studentSessionData = []
        sessionCourse.forEach(element => {
          studentSessionData.push({
            "sessionId": element.id,
            "studentId": mainStudentcourse.studentId
          })
        });
        await studentSession.create(studentSessionData)
        callback(null, newCours)
      })
    } catch (error) {
      callback(error)
    }
  };
};
