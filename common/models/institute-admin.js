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
};
