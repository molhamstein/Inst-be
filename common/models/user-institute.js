'use strict';
var g = require('strong-globalize')();
var debug = require('debug')('loopback:user');

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
};
