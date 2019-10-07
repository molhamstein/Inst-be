'use strict';

module.exports = function (User) {


  User.validatesUniquenessOf('phonenumber', {
    message: 'phonenumber is not unique'
  });
  User.validatesInclusionOf('gender', {
    in: ['male', 'female']
  });


  User.createUser = function (data) {
    return new Promise(function (resolve, reject) {
      User.create(data, function (err, user) {
        if (err) reject(err)
        resolve(user)
      })
    })
  }


  User.checkUser = function (phonenumber, callback) {
    User.findOne({
      "where": {
        "phonenumber": phonenumber
      }
    }, function (err, user) {
      if (err) return callback(err)
      return callback(err, user)
    })
  };


  User.checkRoleInstituteAdmin = function (instituteId, req) {
    return new Promise(function (resolve, reject) {
      var institutesAdminModel = User.app.models.instituteAdmin;
      var principalType = req.accessToken.principalType
      var userId = req.accessToken.mainUserId
      if (principalType == "admin") {
        resolve()
      } else
      if (instituteId == null) {
        reject(User.app.err.notFound.instituteNotFound())
      } else {
        institutesAdminModel.findOne({
          "where": {
            "instituteId": instituteId,
            "userInstituteId": userId
          }
        }, function (err, admin) {
          if (err) reject(err)
          else if (admin == null) {
            reject(User.app.err.global.authorization())
          } else
            resolve()
        })
      }
    })
  }


  User.checkRoleInstituteUser = function (instituteId, req) {
    return new Promise(function (resolve, reject) {
      var institutesAdminModel = User.app.models.instituteAdmin;
      var branchModel = User.app.models.Branch
      var branchAdminModel = User.app.models.branchAdmin;
      var principalType = req.accessToken.principalType
      var userId = req.accessToken.mainUserId
      if (principalType == "admin") {
        resolve()
      } else if (instituteId == null) {
        reject(User.app.err.notFound.instituteNotFound())
      } else {
        institutesAdminModel.findOne({
          "where": {
            "instituteId": instituteId,
            "userInstituteId": userId
          }
        }, function (err, admin) {
          if (err) reject(err)
          else if (admin) {
            resolve()
          } else {
            branchModel.find({
              "where": {
                "instituteId": instituteId
              }
            }, function (err, data) {
              if (err) reject(err)
              var arrayOfBranchId = []
              data.forEach(element => {
                arrayOfBranchId.push(element.id)
              });
              branchAdminModel.find({
                "where": {
                  "userInstituteId": userId,
                  "branchId": {
                    "inq": arrayOfBranchId
                  }
                }
              }, function (err, data) {
                if (err) reject(err)
                else if (data.length > 0) resolve()
                else reject(User.app.err.global.authorization())
              })
            })
          }
        })
      }
    })
  }


  User.checkRoleBranchAdmin = function (instituteId, branchId, req) {
    return new Promise(function (resolve, reject) {
      var institutesAdminModel = User.app.models.instituteAdmin;
      var branchAdminModel = User.app.models.branchAdmin;
      var principalType = req.accessToken.principalType
      var userId = req.accessToken.mainUserId
      if (principalType == "admin") {
        resolve()
      } else if (instituteId == null) {
        reject(User.app.err.notFound.instituteNotFound())
      } else {
        institutesAdminModel.findOne({
          "where": {
            "instituteId": instituteId,
            "userInstituteId": userId
          }
        }, function (err, admin) {
          if (err) reject(err)
          if (admin)
            resolve()
          else {
            if (branchId == null) {
              reject(User.app.err.notFound.branchNotFound())
            } else {
              branchAdminModel.findOne({
                "where": {
                  "branchId": branchId,
                  "userInstituteId": userId
                }
              }, function (err, branchAdmin) {
                if (err) reject(err)
                if (branchAdmin) {
                  resolve()
                } else
                  reject(User.app.err.global.authorization())

              })
            }
          }
        })
      }
    })
  }
};
