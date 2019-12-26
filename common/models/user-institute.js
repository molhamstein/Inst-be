'use strict';
var g = require('strong-globalize')();
var debug = require('debug')('loopback:user');
var async = require("async");

module.exports = function (Userinstitute) {


  Userinstitute.validatesPresenceOf('email', 'email');
  Userinstitute.validatesUniquenessOf('email', {
    message: 'email is not unique'
  });


  Userinstitute.changeUserInstituePassword = async function (oldPassword, newPassword, req, callback) {
    try {
      var principalType = req.accessToken.principalType
      var mainUserId = req.accessToken.mainUserId
      if (principalType != "userInstitute") {
        throw Userinstitute.app.err.global.authorization()
      }
      var user = await Userinstitute.findById(mainUserId);
      var hasPassword = await user.hasPassword(oldPassword)
      if (hasPassword == false) {
        throw Userinstitute.app.err.user.oldPasswordIsWrong()
      }
      var newUser = await user.updateAttributes({
        'password': Userinstitute.hashPassword(newPassword),
      })
      callback(null, newUser)
    } catch (error) {
      callback(error)
    }
  };


  Userinstitute.updateUserInstitue = async function (name, gender, birthdate, req, callback) {
    try {
      var principalType = req.accessToken.principalType
      var mainUserId = req.accessToken.mainUserId
      if (principalType != "userInstitute") {
        throw Userinstitute.app.err.global.authorization()
      }
      var user = await Userinstitute.findById(mainUserId);
      var newUser = await user.updateAttributes({
        'name': name,
        "gender": gender,
        "birthdate": birthdate
      })
      callback(null, newUser)
    } catch (error) {
      callback(error)
    }
  };

  Userinstitute.getAllBranch = async function (req, callback) {
    try {
      var principalType = req.accessToken.principalType
      var mainUserId = req.accessToken.mainUserId
      if (principalType != "userInstitute") {
        throw Userinstitute.app.err.global.authorization()
      }
      var user = await Userinstitute.findById(mainUserId);

      var allUserBranch = []
      var objectBranch = [];
      var userInstitute = await Userinstitute.app.models.instituteAdmin.find({
        "where": {
          "userInstituteId": user.id
        }
      })
      userInstitute.forEach(element => {
        objectBranch.push({
          "key": "instituteId",
          "value": element.instituteId
        })
      });
      var userBranch = await Userinstitute.app.models.branchAdmin.find({
        "where": {
          "userInstituteId": user.id
        }
      })

      userBranch.forEach(element => {
        objectBranch.push({
          "key": "branchId",
          "value": element.branchId
        })
      });
      // callback(null, objectBranch.length)

      for (let index = 0; index < objectBranch.length; index++) {
        const element = objectBranch[index];
        var whereObject = {}
        whereObject[element.key] = element.value
        const brnach = await Userinstitute.app.models.Branch.find({
          "where": whereObject
        })
        allUserBranch = allUserBranch.concat(brnach)
        if (index + 1 == userInstitute.length) {
          callback(null, allUserBranch)
        }
      }
    } catch (error) {
      callback(error)
    }
  }
};
