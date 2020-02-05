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


  Institute.getStudents = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['instituteId'] = id
      if (filter["limit"] == null)
        filter['limit'] = 10
      if (filter["skip"] == null)
        filter['skip'] = 0

      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var users = await Institute.app.query.towLevel(Institute.app, "student", "user", "userId", "id", filter, false)

      callback(null, users)
    } catch (error) {
      callback(error)
    }
  };

  Institute.getStudentsCount = async function (id, where = {}, req, callback) {
    try {
      // callback(null, filter)

      where['instituteId'] = id
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var studentCount = await Institute.app.query.towLevel(Institute.app, "student", "user", "userId", "id", where, true)

      callback(null, studentCount)
    } catch (error) {
      callback(error)
    }
  };


  Institute.getInstitutePayment = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['instituteId'] = id
      if (filter["limit"] == null)
        filter['limit'] = 10
      if (filter["skip"] == null)
        filter['skip'] = 0

      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var payments = await Institute.app.models.institutePayment.find(filter)

      callback(null, payments)
    } catch (error) {
      callback(error)
    }
  };

  Institute.getInstitutePaymentCount = async function (id, where = {}, req, callback) {
    try {
      // callback(null, filter)

      where['instituteId'] = id
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var paymentsCount = await Institute.app.models.institutePayment.count(where)

      callback(null, paymentsCount)
    } catch (error) {
      callback(error)
    }
  };


  Institute.getTransactions = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['instituteId'] = id
      if (filter["limit"] == null)
        filter['limit'] = 10
      if (filter["skip"] == null)
        filter['skip'] = 0

      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var transactions = await Institute.app.models.Transaction.find(filter) //.query.towLevel(Institute.app, "student", "user", "userId", "id", filter, false)

      callback(null, transactions)
    } catch (error) {
      callback(error)
    }
  };

  Institute.getTransactionsCount = async function (id, where = {}, req, callback) {
    try {
      where['instituteId'] = id
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var transactionCount = await Institute.app.models.Transaction.count(where)
      callback(null, transactionCount)
    } catch (error) {
      callback(error)
    }
  };


  Institute.getTeachers = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['instituteId'] = id
      if (filter["limit"] == null)
        filter['limit'] = 10
      if (filter["skip"] == null)
        filter['skip'] = 0

      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var users = await Institute.app.query.towLevel(Institute.app, "teacher", "user", "userId", "id", filter, false)

      callback(null, users)
    } catch (error) {
      callback(error)
    }
  };

  Institute.getTeachersCount = async function (id, where = {}, req, callback) {
    try {
      // callback(null, filter)

      where['instituteId'] = id
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var teacherCount = await Institute.app.query.towLevel(Institute.app, "teacher", "user", "userId", "id", where, true)

      callback(null, teacherCount)
    } catch (error) {
      callback(error)
    }
  };

  Institute.getAdmins = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['instituteId'] = id
      if (filter["limit"] == null)
        filter['limit'] = 10
      if (filter["skip"] == null)
        filter['skip'] = 0

      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var admins = await Institute.app.query.towLevel(Institute.app, "instituteadmin", "userinstitute", "userInstituteId", "id", filter, false)

      callback(null, admins)
    } catch (error) {
      callback(error)
    }
  };



  Institute.getAdminsCount = async function (id, where = {}, req, callback) {
    try {
      // callback(null, filter)

      where['instituteId'] = id
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      var admins = await Institute.app.query.towLevel(Institute.app, "instituteadmin", "userinstitute", "userInstituteId", "id", where, ["id", "userInstituteId", "instituteId", "createdAt"], ["gender", "birthdate", "name", "email"], true)

      callback(null, admins)
    } catch (error) {
      callback(error)
    }
  };


  Institute.createWaitingList = async function (id, titleEn, titleAr, subcategoryId, inceptionCount, count = 0, note, req, callback) {
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
        throw Institute.app.err.waitingList.duplicateWaitingList()
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


  Institute.getWaitingList = async function (id, filter = {}, req, callback) {
    try {
      await Institute.app.models.user.checkRoleInstituteUser(id, req)
      if (filter.where == null) {
        filter.where = {
          "instituteId": id
        }
      } else {
        filter.where.instituteId = id
      }
      var WaitingList = await Institute.app.models.waitingList.find(filter)

      callback(null, WaitingList)
    } catch (error) {
      callback(error)
    }
  };


  Institute.getWaitingListCount = async function (id, where = {}, req, callback) {
    try {
      await Institute.app.models.user.checkRoleInstituteUser(id, req)

      where.instituteId = id
      var WaitingListCount = await Institute.app.models.waitingList.count(where)
      callback(null, {
        "count": WaitingListCount
      })
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

  Institute.getCourseCount = async function (id, where = {}, req, callback) {
    try {
      var institute = await Institute.findById(id)
      if (institute == null) {
        throw Institute.app.err.global.notFound()
      }
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)

      where.instituteId = id

      var coursesCount = await Institute.app.models.Course.count(where)
      callback(null, coursesCount)
    } catch (error) {
      callback(error)
    }
  };

  Institute.getCourse = async function (id, filter, req, callback) {
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
      } else if (filter.where.and != null) {
        filter.where.and.push({
          "instituteId": id
        })
      } else {
        filter.where.instituteId = id
      }
      console.log("JSON.stringify(filter)")
      console.log(JSON.stringify(filter))
      var courses = await Institute.app.models.Course.find(filter)
      callback(null, courses)
    } catch (error) {
      callback(error)
    }
  };


  Institute.getBranchCount = async function (id, where, req, callback) {
    try {
      var institute = await Institute.findById(id)
      if (institute == null) {
        throw Institute.app.err.global.notFound()
      }
      await Institute.app.models.user.checkRoleInstituteAdmin(id, req)
      if (where == null) {
        where = {
          "instituteId": id
        }
      } else {
        where.instituteId = id
      }
      var branchesCount = await Institute.app.models.Branch.count(where)
      callback(null, {
        "count": branchesCount
      })
    } catch (error) {
      callback(error)
    }
  };

  Institute.addInstitutePayment = async function (instituteId, value, date, note, req, callback) {
    try {
      await Institute.app.dataSources.mainDB.transaction(async models => {
        const {
          institutePayment
        } = models
        const {
          institute
        } = models
        var mainInstitute = await institute.findById(instituteId);
        if (mainInstitute == null) {
          throw Institute.app.err.notFound.instituteNotFound()
        }
        await institutePayment.create({
          "value": value,
          "instituteId": instituteId,
          "date": date,
          "note": note
        })
        var frozenBalance = value + mainInstitute.frozenBalance
        await mainInstitute.updateAttribute("frozenBalance", frozenBalance)
        callback(null, mainInstitute)
      })
    } catch (error) {
      callback(error)
    }
  }


};
