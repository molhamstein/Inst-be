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


  Session.changeSession = async function (id, startAt, duration, venueId, req, callback) {
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
        "venueId": venueId
      })
      callback(null, mainSession.course())
    } catch (error) {
      callback(error)
    }
  };

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
