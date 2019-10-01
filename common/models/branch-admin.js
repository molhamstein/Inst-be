'use strict';
var g = require('strong-globalize')();
var debug = require('debug')('loopback:user');

module.exports = function (Branchadmin) {


  Branchadmin.login = function (credentials, include, fn) {
    var self = this;
    if (typeof include === 'function') {
      fn = include;
      include = undefined;
    }

    fn = fn || utils.createPromiseCallback();

    include = (include || '');
    if (Array.isArray(include)) {
      include = include.map(function (val) {
        return val.toLowerCase();
      });
    } else {
      include = include.toLowerCase();
    }


    var query = {
      email: credentials.email
    }

    if (!query.email) {
      var err2 = new Error(g.f('{{email}} is required'));
      err2.statusCode = 400;
      err2.code = 'EMAIL_REQUIRED';
      fn(err2);
      return fn.promise;
    }

    self.app.models.User.findOne({
      where: query
    }, function (err, user) {
      console.log(query, err, user);
      var defaultError = new Error(g.f('login failed'));
      defaultError.statusCode = 401;
      defaultError.code = 'LOGIN_FAILED';

      function tokenHandler(err, token) {
        if (err) return fn(err);
        if (Array.isArray(include) ? include.indexOf('user') !== -1 : include === 'user') {
          // NOTE(bajtos) We can't set token.user here:
          //  1. token.user already exists, it's a function injected by
          //     "AccessToken belongsTo User" relation
          //  2. ModelBaseClass.toJSON() ignores own properties, thus
          //     the value won't be included in the HTTP response
          // See also loopback#161 and loopback#162
          token.__data.user = user;
        }
        fn(err, token);
      }

      if (err) {
        debug('An error is reported from User.findOne: %j', err);
        fn(defaultError);
      } else if (user) {
        self.findOne({
          where: {
            userId: user.userId
          }
        }, function (err, branchAdmin) {
          branchAdmin.hasPassword(credentials.password, function (err, isMatch) {
            if (err) {
              debug('An error is reported from User.hasPassword: %j', err);
              fn(defaultError);
            } else if (isMatch) {

              if (branchAdmin.createAccessToken.length === 2) {
                branchAdmin.createAccessToken(credentials.ttl, tokenHandler);
              } else {
                branchAdmin.createAccessToken(credentials.ttl, credentials, tokenHandler);
              }

            } else {
              debug('The password is invalid for user %s', query.email || query.username);
              fn(defaultError);
            }
          });
        })

      } else {
        debug('No matching record is found for user %s', query.email || query.username);
        fn(defaultError);
      }
    });
    return fn.promise;
  }

  Branchadmin.isAdminInBranches = function (userId, branchId) {
    return new Promise(function (resolve, reject) {
      Branchadmin.findOne({
        "where": {
          "branchId": branchId,
          "userId": userId
        }
      }, function (err, branchAdmin) {
        if (err) reject(err)
        resolve(branchAdmin)
      })
    })
  }

  Branchadmin.changePassword = async function (id, newPassword, callback) {
    try {
      var branchAdmin = await Branchadmin.findById(id)
      if (branchAdmin == null)
        throw Branchadmin.app.err.global.notFound()
      var instituteUser = await branchAdmin.userInstitute()
      await instituteUser.updateAttributes({
        'password': Branchadmin.app.models.userInstitute.hashPassword(newPassword),
      })
      callback(null, instituteUser)
    } catch (error) {
      callback(error)
    }
  };
};
