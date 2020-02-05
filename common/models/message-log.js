'use strict';

module.exports = function (Messagelog) {
  const messageCost = 50
  Messagelog.sendOneMessage = function (instituteId, message, phonenumber, userId) {
    console.log(instituteId)
    console.log(message)
    console.log(phonenumber)
    console.log(userId)
    return new Promise(function (resolve, reject) {
      Messagelog.app.models.Institute.findById(instituteId, function (err, institute) {
        if (err) reject(err)
        var messagesBalance = institute.messagesBalance + messageCost
        var frozenBalance = institute.frozenBalance - messageCost

        institute.updateAttributes({
          "messagesBalance": messagesBalance,
          "frozenBalance": frozenBalance
        }, function (err, newIns) {
          if (err) reject(err)
          Messagelog.create({
            "phonenumber": phonenumber,
            "instituteId": instituteId,
            "message": message,
            "userId": userId,
          }, function (err, data) {
            if (err) reject(err)
            resolve()
          })
        })
      })
    })
  }
  // var asyncForEach = require('async-foreach');

  Messagelog.sendMultiMessage = async function (instituteId, message, users, req, callback) {
    try {
      await Messagelog.app.models.user.checkRoleInstituteUser(instituteId, req)
      var mainInstitute = await Messagelog.app.models.Institute.findById(instituteId);
      if (mainInstitute.frozenBalance < users.length * messageCost) {
        throw Institute.app.err.notFound.instituteNotFound()
      }
      await Promise.all(users.map(async (element) => {
        console.log("element")
        console.log(element)
        await Messagelog.sendOneMessage(instituteId, message, element.phonenumber, element.userId)
        // console.log(contents)
      }));
      callback(null, {
        "status": "ok"
      })
    } catch (error) {
      callback(error)
    }
  };


};
