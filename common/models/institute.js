'use strict';

module.exports = function (Institute) {


  Institute.validatesInclusionOf('status', {
    in: ['active', 'deactive']
  });


  Institute.createNewInstitute = async function (instituteData, imagesId = [], adminData, callback) {
    try {
      await Institute.app.dataSources.mainDB.transaction(async models => {
        console.log(models)
        const {
          userInstitute
        } = models;
        const {
          institute
        } = models
        const {
          institutesImages
        } = models;
        const {
          instituteAdmin
        } = models
        const {
          RoleMapping
        } = models
        var imagesData = []

        var newUserInstitute = await userInstitute.findOne({
          "where": {
            "email": adminData.email
          }
        })
        if (newUserInstitute == null)
          newUserInstitute = await userInstitute.create(adminData);
        var newInstitute = await institute.create(instituteData);
        var newInstituteAdmin = await instituteAdmin.create({
          "userInstituteId": newUserInstitute.id,
          "instituteId": newInstitute.id
        });
        var newRoleMapping = await RoleMapping.create({
          "principalType": "userInstitute",
          "principalId": newUserInstitute.id,
          "roleId": 2
        })
        imagesId.forEach(element => {
          imagesData.push({
            "instituteId": newInstitute.id,
            "imageId": element
          })
        });
        var newInstitutesImages = await institutesImages.create(imagesData);
        newInstitute = await institute.findById(newInstitute.id);
        callback(null, newInstitute)
      });
    } catch (e) {
      callback(e)

    }
  }


  Institute.updateInstitue = async function (id, data, imagesId = [], req, callback) {
    try {
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      await Institute.app.dataSources.mainDB.transaction(async models => {
        const {
          institute
        } = models
        const {
          institutesImages
        } = models;
        await institutesImages.destroyAll({
          "instituteId": id,
        })
        var imagesData = []
        imagesId.forEach(element => {
          imagesData.push({
            "instituteId": id,
            "imageId": element
          })
        });
        var newInstitutesImages = await institutesImages.create(imagesData);
        var oldInstitute = await institute.findById(id)
        var newInstitute = await oldInstitute.updateAttributes(data)
        callback(null, newInstitute)
      })
    } catch (error) {
      return callback(error)
    }
  };


  Institute.activeInstitute = function (id, callback) {
    Institute.findById(id, function (err, institute) {
      if (err) return callback(err)
      if (institute == null) {
        return callback(Institute.app.err.global.notFound())
      }
      if (institute.status == 'active') {
        return callback(Institute.app.err.global.alreadyActive())
      }
      institute.updateAttribute("status", "active", function (err, newInstitute) {
        if (err) return callback(err)
        return callback(null, newInstitute);
      })
    })
  };


  Institute.deactiveInstitute = function (id, callback) {
    Institute.findById(id, function (err, institute) {
      if (err) return callback(err)
      if (institute == null) {
        return callback(Institute.app.err.global.notFound())
      }
      if (institute.status == 'deactive') {
        return callback(Institute.app.err.global.alreadyDeactive())
      }
      institute.updateAttribute("status", "deactive", function (err, newInstitute) {
        if (err) return callback(err)
        return callback(null, newInstitute);
      })
    })
  };


  Institute.addAdmin = async function (id, phonenumber, name, gender, birthdate, email, password, req, callback) {
    try {
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      await Institute.app.dataSources.mainDB.transaction(async models => {
        const {
          userInstitute
        } = models;
        const {
          instituteAdmin
        } = models
        const {
          RoleMapping
        } = models
        var userInsObj = await userInstitute.findOne({
          "where": {
            "email": email
          }
        })
        if (userInsObj == null) {
          userInsObj = await userInstitute.create({
            "phonenumber": phonenumber,
            "name": name,
            "gender": gender,
            "email": email,
            "password": password,
            "birthdate": birthdate
          })
        }
        var newInstituteAdmin = await instituteAdmin.create({
          "userInstituteId": userInsObj.id,
          "instituteId": id,

        });
        var newRoleMapping = await RoleMapping.create({
          "principalType": "userInstitute",
          "principalId": userInsObj.id,
          "roleId": 2
        })
        callback(null, userInsObj)
      })
    } catch (error) {
      return callback(error)
    }
  };


  Institute.getAdmins = async function (id, req, callback) {
    try {
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var admins = await Institute.app.models.instituteAdmin.find({
        "where": {
          "instituteId": id
        }
      })
      callback(null, admins)
    } catch (error) {
      callback(error)
    }
  };


  Institute.createWaitingList = async function (id, titleEn, titleAr, subcategoryId, inceptionCount, count, note, req, callback) {
    try {
      await Institute.app.models.user.checkRoleInstituteUser(id, req)
      var oldWaitingList = await Institute.app.models.waitingList.findOne({
        "where": {
          "instituteId": id,
          "subcategoryId": subcategoryId,
          "status": "active"
        }
      })
      if (oldWaitingList) {
        throw Institute.app.err.global.authorization()
      }
      var newWaitingList = await Institute.app.models.waitingList.create({
        "titleEn": titleEn,
        "titleAr": titleAr,
        "instituteId": id,
        "subcategoryId": subcategoryId,
        "count": count,
        "inceptionCount": inceptionCount,
        "note": note
      })
      callback(null, newWaitingList)
    } catch (error) {
      callback(error)
    }
  };


  Institute.getWaitingList = async function (id, req, callback) {
    try {
      await Institute.app.models.user.checkRoleInstituteUser(id, req)
      var WaitingList = await Institute.app.models.waitingList.findOne({
        "where": {
          "instituteId": id
        }
      })

      callback(null, WaitingList)
    } catch (error) {
      callback(error)
    }
  };


  Institute.getBranch = async function (id, filter, req, callback) {
    try {
      var institute = await Institute.findById(id)
      if (institute == null) {
        throw Institute.app.err.global.notFound()
      }
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      if (filter == null) {
        filter = {
          "where": {
            "instituteId": id
          }
        }
      } else if (filter.where == null) {
        filter.where = {
          "instituteId": id
        }
      } else {
        filter.where.instituteId = id
      }
      var branches = await Institute.app.models.Branch.find(filter)
      callback(null, branches)
    } catch (error) {
      callback(error)
    }
  };
};
