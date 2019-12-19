'use strict';
var async = require("async");

module.exports = function (Course) {


  Course.createNewCourse = async function (data, sessions, imagesId = [], req, callback) {
    try {
      await Course.app.models.user.checkRoleBranchAdmin(data.instituteId, data.branchId, req)
      await Course.app.dataSources.mainDB.transaction(async models => {
        const {
          course
        } = models
        const {
          courseImages
        } = models
        const {
          session
        } = models
        var sessionData = []
        var newCourse = await course.create(data)
        if (imagesId.length != 0) {
          var imageData = []
          imagesId.forEach(element => {
            imageData.push({
              "imageId": element,
              "courseId": newCourse.id
            })
          });
          await courseImages.create(imageData)
        }
        sessions.forEach(element => {
          sessionData.push({
            "venueId": element.venueId,
            "startAt": new Date(element.start),
            "endAt": addMinutes(new Date(element.start), element.duration),
            "courseId": newCourse.id,
            "duration": element.duration
          })
        });
        var sessionHasError = await session.checkSession(sessionData);
        if (sessionHasError.length > 0) {
          throw Course.app.err.course.sessionHasError(sessionHasError);
        }
        await session.create(sessionData)
        newCourse = await course.findById(newCourse.id)
        callback(null, newCourse)
      })
    } catch (error) {
      callback(error)
    }
  };


  Course.getOneCourse = async function (id, req, callback) {
    try {
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      callback(null, mainCourse)
    } catch (error) {
      callback(error)
    }
  };


  Course.editCourse = async function (id, data, imagesId, req, callback) {
    try {
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      await Course.app.dataSources.mainDB.transaction(async models => {
        const {
          course
        } = models
        const {
          courseImages
        } = models

        await courseImages.destroyAll({
          "courseId": id,
        })

        if (imagesId.length != 0) {
          var imageData = []
          imagesId.forEach(element => {
            imageData.push({
              "imageId": element,
              "courseId": id
            })
          });
          await courseImages.create(imageData)
        }
        var oldCourse = await course.findById(id)
        var updateData = {
          "cost": data.cost,
          "sessionsNumber": data.sessionsNumber,
          "nameEn": data.nameEn,
          "nameAr": data.nameAr,
          "descriptionEn": data.descriptionEn,
          "descriptionAr": data.descriptionAr,
          "startAt": data.startAt,
          "maxCountStudent": data.maxCountStudent,
          "sessionAvgDuration": data.sessionAvgDuration
        }
        var newCourse = await oldCourse.updateAttributes(updateData)
        callback(null, newCourse)
      })
    } catch (error) {
      callback(error)
    }
  };


  Course.addTeacherToCourse = async function (id, teacherId, typePaid, value, req, callback) {
    try {
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var oldTeacher = await Course.app.models.teacherCourse.findOne({
        "where": {
          "teacherId": teacherId,
          "courseId": id
        }
      })
      if (oldTeacher)
        throw Course.app.err.course.teacherAlreadyInCourse()
      var teacherCourse = await Course.app.models.teacherCourse.create({
        "teacherId": teacherId,
        "typePaid": typePaid,
        "value": value,
        "courseId": id
      })
      callback(null, teacherCourse)
    } catch (error) {
      callback(error)
    }
  };


  Course.addSessionToCourse = async function (id, sessions, req, callback) {
    try {
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      await Course.app.dataSources.mainDB.transaction(async models => {
        const {
          session
        } = models
        const {
          studentSession
        } = models
        const {
          studentCourse
        } = models
        var sessionData = []
        sessions.forEach(element => {
          sessionData.push({
            "venueId": element.venueId,
            "startAt": new Date(element.startAt),
            "endAt": addMinutes(new Date(element.startAt), element.duration),
            "courseId": id,
            "duration": element.duration
          })
        });
        var sessionHasError = await session.checkSession(sessionData);
        if (sessionHasError.length > 0) {
          throw Course.app.err.course.sessionHasError(sessionHasError);
        }
        var newSessions = await session.create(sessionData)
        var studentInCourse = await studentCourse.find({
          "where": {
            "courseId": id
          }
        })
        var newSessionStudentData = []
        newSessions.forEach(oneSession => {
          studentInCourse.forEach(element => {
            newSessionStudentData.push({
              "sessionId": oneSession.id,
              "studentId": element.studentId,
            })
          });
        });
        await studentSession.create(newSessionStudentData)
        callback(null, mainCourse)
      })
    } catch (error) {
      callback(error)
    }
  };


  Course.getTeacherInCourse = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['courseId'] = id
      if (filter["limit"] == null)
        filter['limit'] = 10
      if (filter["skip"] == null)
        filter['skip'] = 0
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var teacherInCourse = await Course.app.query.threeLevel(Course.app, "teachercourse", "teacher", "user", "teacherId", "id", "userId", "id", filter, false)

      callback(null, teacherInCourse);
    } catch (error) {
      callback(error)
    }
  };


  Course.getTeacherInCourseCount = async function (id, where = {}, req, callback) {
    try {
      where['courseId'] = id
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var teacherInCourse = await Course.app.query.threeLevel(Course.app, "teachercourse", "teacher", "user", "teacherId", "id", "userId", "id", where, true)
      callback(null, teacherInCourse);
    } catch (error) {
      callback(error)
    }
  };


  Course.getStudentInCourse = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['courseId'] = id
      if (filter["limit"] == null)
        filter['limit'] = 10
      if (filter["skip"] == null)
        filter['skip'] = 0
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var studentInCourse = await Course.app.query.threeLevel(Course.app, "studentcourse", "student", "user", "studentId", "id", "userId", "id", filter, false)
      callback(null, studentInCourse);
    } catch (error) {
      callback(error)
    }
  };


  Course.getStudentInCourseCount = async function (id, where = {}, req, callback) {
    try {
      where['courseId'] = id
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var studentInCourse = await Course.app.query.threeLevel(Course.app, "studentcourse", "student", "user", "studentId", "id", "userId", "id", where, true)
      callback(null, studentInCourse);
    } catch (error) {
      callback(error)
    }
  };


  Course.cheackFullCourses = function (coursesId) {
    return new Promise(function (resolve, reject) {
      var courseHasError = []
      async.forEachOf(coursesId, function (element, index, callback) {
        cheackFullnOneCourses(element, function (err, data) {
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


  function cheackFullnOneCourses(courseId, callback) {
    Course.findById(courseId, function (err, data) {
      if (err) return callback(err)
      if (data.maxCountStudent < data.countStudent + 1)
        callback(null, data)
      else
        callback()
    })
  }


  function addMinutes(date, m) {
    date.setTime(date.getTime() + (m * 60 * 1000));
    return date;
  }
};
