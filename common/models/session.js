'use strict';
var async = require("async");

module.exports = function (Session) {


  Session.checkSession = function (sessionsData) {
    return new Promise(function (resolve, reject) {
      var sessionHasError = []
      async.forEachOf(sessionsData, function (element, index, callback) {
        checkOneSession(element, function (err, data) {
          if (err) reject(err)
          if (data) {
            delete data.endAt
            delete data.courseId
            sessionHasError.push(data)
          }
          callback()
        })
      }, function () {
        console.log("Finish loop")
        resolve(sessionHasError)
      })
    })
  }


  Session.checkSessions = async function (sessions, req, callback) {
    try {
      var sessionData = []
      sessions.forEach(element => {
        sessionData.push({
          "venueId": element.venueId,
          "startAt": new Date(element.start),
          "endAt": addMinutes(new Date(element.start), element.duration),
          "duration": element.duration
        })
      });
      var sessionHasError = await Session.checkSession(sessionData);
      if (sessionHasError.length > 0) {
        throw Session.app.err.course.sessionHasError(sessionHasError);
      }
      callback(null, {
        "status": "ok"
      })
    } catch (error) {
      callback(error)
    }
  };


  Session.cancelSession = async function (id, req, callback) {
    try {
      var mainSession = await Session.findById(id)
      if (mainSession == null)
        throw Session.app.err.global.notFound()
      await Session.app.models.user.checkRoleInstituteUser(mainSession.course().instituteId, req)
      await Session.app.dataSources.mainDB.transaction(async models => {
        const {
          session
        } = models
        const {
          studentSession
        } = models

        await studentSession.destroyAll({
          "sessionId": id
        })
        var oldSession = await session.findById(id)
        var newSession = await oldSession.updateAttribute("status", "deactive")
        callback(null, mainSession.course())
      })
      callback(null, mainSession);
    } catch (error) {
      callback(error)
    }
  };


  Session.changeSession = async function (id, startAt, duration, venueId, name, req, callback) {
    try {
      var mainSession = await Session.findById(id)
      if (mainSession == null)
        throw Session.app.err.global.notFound()
      await Session.app.models.user.checkRoleInstituteUser(mainSession.course().instituteId, req)
      var endAt = addMinutes(startAt, duration)
      var filter = {
        "where": {
          "startAt": {
            "lt": endAt
          },
          "endAt": {
            "gt": startAt
          },
          "venueId": venueId,
          "status": "active",
          "id": {
            "neq": id
          }
        }
      }
      var anotherSession = await Session.findOne(filter)
      if (anotherSession) {
        throw Session.app.err.course.sessionHasError([{
          "venueId": venueId,
          "startAt": startAt,
          "duration": duration
        }])
      }
      await mainSession.updateAttributes({
        "startAt": startAt,
        "endAt": endAt,
        "name": name,
        "venueId": venueId
      })

      var studentSessionArray = await Session.app.models.studentSession.find({
        "where": {
          "sessionId": mainSession.id
        }
      })
      Session.app.models.notification.createNotifications(studentSessionArray, 'studentId', 'student', 1, 'sessionId', mainSession.id)
      callback(null, mainSession.course())
    } catch (error) {
      callback(error)
    }
  };


  Session.getSession = async function (id, req, callback) {
    try {
      var mainSession = await Session.findById(id)
      if (mainSession == null)
        throw Session.app.err.global.notFound()
      await Session.app.models.user.checkRoleInstituteUser(mainSession.course().instituteId, req)
      callback(null, mainSession)
    } catch (error) {
      callback(error)
    }
  }

  Session.getStudentInSession = async function (id, req, callback) {
    try {
      var mainSession = await Session.findById(id)
      if (mainSession == null)
        throw Session.app.err.global.notFound()
      await Session.app.models.user.checkRoleInstituteUser(mainSession.course().instituteId, req)
      var student = await Session.app.models.studentSession.find({
        "where": {
          "sessionId": id
        }
      })
      callback(null, student)
    } catch (error) {
      callback(error)
    }
  }

  Session.getTeacherInSession = async function (id, req, callback) {
    try {
      var mainSession = await Session.findById(id)
      if (mainSession == null)
        throw Session.app.err.global.notFound()
      await Session.app.models.user.checkRoleInstituteUser(mainSession.course().instituteId, req)


      var totalFromSession = await Session.app.query.getSum(Session.app, {
        "sessionId": id,
        "type": "receiveSession"
      })
      var filter = {
        "where": {
          "courseId": mainSession.courseId
        }
      }
      var teacherInCourse = await Session.app.query.threeLevel(Session.app, "teacherCourse", "teacher", "user", "teacherId", "id", "userId", "id", filter, false)
      var data = await getTeachersInSession(teacherInCourse, Session, id, totalFromSession)
      callback(null, data)

    } catch (error) {
      callback(error)
    }
  }


  function getTeachersInSession(teacherInCourse, Session, sessionId, totalFromSession) {
    return new Promise(function (resolve, reject) {
      async.forEachOf(teacherInCourse, function (element, index, callback) {
        Session.app.query.getSum(Session.app, {
          "sessionId": sessionId,
          "teacherId": element.id,
          "type": "paidTeacherCourse"
        }, function (err, data) {
          console.log("data")
          console.log(data)
          teacherInCourse[index]["totalFromSession"] = totalFromSession
          teacherInCourse[index]["totalPaid"] = data * -1
          callback()
        })
      }, function () {
        console.log("Finish loop")
        resolve(teacherInCourse)
      })

    })
  }

  Session.attendStudent = async function (id, studentId, code, req, callback) {
    try {
      await Session.app.dataSources.mainDB.transaction(async models => {
        const {
          session
        } = models
        const {
          student
        } = models
        const {
          studentSession
        } = models
        const {
          studentCourse
        } = models
        const {
          transaction
        } = models
        var mainSession = await session.findById(id)
        if (mainSession == null)
          throw Session.app.err.global.notFound()

        var mainCourse = mainSession.course()
        await Session.app.models.user.checkRoleInstituteUser(mainSession.course().instituteId, req)
        var mainStudent
        if (studentId == null && code != null) {
          mainStudent = await student.findOne({
            "where": {
              "instituteId": mainCourse.instituteId,
              "code": code
            }
          })
        } else {
          mainStudent = await student.findById(studentId)
        }
        if (mainStudent == null)
          throw Session.app.err.notFound.studentNotFound()

        studentId = mainStudent.id

        var mainStudentSession = await studentSession.findOne({
          "where": {
            "sessionId": id,
            "studentId": studentId,
          }
        })
        if (mainStudentSession == null)
          throw Session.app.err.global.notFound()

        if (mainStudentSession.isAttend) {
          throw Session.app.err.session.alreadyAttendSession()
        }
        await mainStudentSession.updateAttributes({
          "isAttend": true,
          "dateAttend": new Date()
        })
        if (mainCourse.typeCost == 'perSession') {
          var mainStudentCourse = await studentCourse.findOne({
            "where": {
              "studentId": studentId,
              "courseId": mainCourse.id
            }
          })
          var balance = 0;
          var attend = 0
          if (mainStudentCourse.frozenBalance >= mainStudentSession.cost) {
            balance = mainStudentSession.cost
          } else if (mainStudentCourse.frozenBalance >= 0) {
            balance = mainStudentCourse.frozenBalance
            attend = mainStudentSession.cost - mainStudentCourse.frozenBalance
          } else {
            attend = mainStudentSession.cost
          }

          await mainStudentSession.updateAttribute("balance", balance);
          var mainStudentCourseFrozen = mainStudentCourse.frozenBalance - mainStudentSession.cost
          var mainStudentCourseBralance = mainStudentCourse.balance + balance
          await mainStudentCourse.updateAttributes({
            "balance": mainStudentCourseBralance,
            "frozenBalance": mainStudentCourseFrozen
          })

          await transaction.create({
            "instituteId": mainCourse.instituteId,
            "branchId": mainCourse.branchId,
            "courseId": mainCourse.id,
            "sessionId": id,
            "studentId": studentId,
            "value": balance,
            "type": "receiveSession"

          })

        }

        callback(null, mainStudentSession)
      })
    } catch (error) {
      callback(error)
    }
  }



  function addMinutes(date, m) {
    date.setTime(date.getTime() + (m * 60 * 1000));
    return date;
  }

  function checkOneSession(session, callback) {
    console.log(session);
    var filter = {
      "where": {
        "startAt": {
          "lt": session.endAt
        },
        "endAt": {
          "gt": session.startAt
        },
        "venueId": session.venueId,
        "status": "active"
      }
    }
    Session.findOne(filter, function (err, data) {
      if (err) return callback(err)
      if (data)
        return callback(null, session)
      else
        return callback(null)

    })
  }
};
