'use strict';

module.exports = function (Instituteadmin) {


  Instituteadmin.isAdminInInstitutes = function (userInstituteId, instituteId) {
    return new Promise(function (resolve, reject) {
      Instituteadmin.findOne({
        "where": {
          "instituteId": instituteId,
          "userInstituteId": userInstituteId
        }
      }, function (err, instituteAdmin) {
        if (err) reject(err)
        resolve(instituteAdmin)
      })
    })
  }


  Instituteadmin.changePasswordInstituteAdmin = async function (id, newPassword, callback) {
    try {
      var instituteAdmin = await Instituteadmin.findById(id)
      if (instituteAdmin == null)
        throw Instituteadmin.app.err.global.notFound()
      var instituteUser = await instituteAdmin.userInstitute()
      await instituteUser.updateAttributes({
        'password': Instituteadmin.app.models.userInstitute.hashPassword(newPassword),
      })
      callback(null, instituteUser)
    } catch (error) {
      callback(error)
    }
  };
};
