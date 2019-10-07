'use strict';
module.exports = function (Branchadmin) {


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


  Branchadmin.changePasswordBranchAdmin = async function (id, newPassword, callback) {
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
