'use strict';

module.exports = function (Branch) {


  Branch.validatesInclusionOf('status', {
    in: ['active', 'deactive']
  });


  Branch.createNewBranch = async function (data, imagesId, req, callback) {
    try {
      await Branch.app.models.user.checkRoleInstituteAdmin(data.instituteId, req)
      await Branch.app.dataSources.mainDB.transaction(async models => {
        const {
          branch
        } = models;
        const {
          branchImages
        } = models;
        if (data.isMain) {
          var isMainBranch = await branch.findOne({
            "where": {
              "isMain": true,
              "instituteId": data.instituteId
            }
          })
          if (isMainBranch)
            throw Branch.app.err.institute.justOneBranchIsMain()
        }
        var imageData = []
        var newBranch = await branch.create(data)
        imagesId.forEach(element => {
          imageData.push({
            "imageId": element,
            "branchId": newBranch.id
          })
        });
        var newBranchImages = await branchImages.create(imageData)
        var newBranch = await branch.findById(newBranch.id)
        callback(null, newBranch)
      })
    } catch (error) {
      callback(error)
    }
  };


  Branch.updateBranch = async function (id, data, imagesId = [], req, callback) {
    try {
      var branch = await Branch.findById(id)
      if (branch == null)
        throw Branch.app.err.global.notFound()
      await Branch.app.models.user.checkRoleInstituteAdmin(branch.instituteId, req)
      await Branch.app.dataSources.mainDB.transaction(async models => {
        const {
          branch
        } = models;
        const {
          branchImages
        } = models;

        await branchImages.destroyAll({
          "branchId": id,
        })
        var imagesData = []
        imagesId.forEach(element => {
          imagesData.push({
            "branchId": id,
            "imageId": element
          })
        });
        var newBranchImages = await branchImages.create(imagesData)
        if (data.isMain) {
          var isMainBranch = await branch.findOne({
            "where": {
              "isMain": true,
              "instituteId": data.instituteId,
              "id": {
                "neq": id
              }
            }
          })
          if (isMainBranch)
            throw Branch.app.err.institute.justOneBranchIsMain()
        }
        var oldBranch = await branch.findById(id)
        if (oldBranch == null) {
          throw Branch.app.err.global.authorization()
        }
        var newBranch = await oldBranch.updateAttributes(data)
        callback(null, newBranch)
      })
    } catch (error) {
      callback(error)
    }
  };


  Branch.activeBranch = async function (id, req, callback) {
    try {

      var branch = await Branch.findById(id);
      if (branch == null)
        throw Branch.app.err.global.notFound()

      await Branch.app.models.user.checkRoleInstituteAdmin(branch.instituteId, req)

      if (branch.status == 'active') {
        throw Branch.app.err.global.alreadyActive()
      }

      var newBranch = await branch.updateAttribute("status", "active")
      callback(null, newBranch)
    } catch (error) {
      callback(error)
    }
  };


  Branch.deactiveBranch = async function (id, req, callback) {
    try {
      var branch = await Branch.findById(id);
      if (branch == null)
        throw Branch.app.err.global.notFound()

      await Branch.app.models.user.checkRoleInstituteAdmin(branch.instituteId, req)

      if (branch.status == 'deactive') {
        throw Branch.app.err.global.alreadyDeactive()
      }

      var newBranch = await branch.updateAttribute("status", "deactive")
      callback(null, newBranch)
    } catch (error) {
      callback(error)
    }
  };


  Branch.addBranchAdmin = async function (id, phonenumber, name, gender, birthdate, email, password, req, callback) {
    try {
      var branch = await Branch.findById(id);
      if (branch == null)
        throw Branch.app.err.global.notFound()
      await Branch.app.models.user.checkRoleBranchAdmin(branch.instituteId, id, req)
      await Branch.app.dataSources.mainDB.transaction(async models => {
        const {
          userInstitute
        } = models;
        const {
          branchAdmin
        } = models
        const {
          RoleMapping
        } = models
        var userObj = await userInstitute.findOne({
          "where": {
            "email": email
          }
        })
        if (userObj == null) {
          userObj = await userInstitute.create({
            "phonenumber": phonenumber,
            "email": email,
            "password": password,
            "name": name,
            "gender": gender,
            "birthdate": birthdate
          })
        }
        var newBranchAdmin = await branchAdmin.create({
          "userInstituteId": userObj.id,
          "branchId": id
        });
        var newRoleMapping = await RoleMapping.create({
          "principalType": "userInstitute",
          "principalId": userObj.id,
          "roleId": 2
        })
        callback(null, userObj)
      })
    } catch (error) {
      return callback(error)
    }

  };


  Branch.getBranchAdmin = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      var branch = await Branch.findById(id);
      if (branch == null)
        throw Branch.app.err.global.notFound()
      await Branch.app.models.user.checkRoleBranchAdmin(branch.instituteId, id, req)
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['branchId'] = id
      if (filter["limit"] == null)
        filter['limit'] = 10
      if (filter["skip"] == null)
        filter['skip'] = 0

      var admins = await Branch.app.query.towLevel(Branch.app, "branchadmin", "userinstitute", "userInstituteId", "id", filter, false)

      callback(null, admins)
    } catch (error) {
      return callback(error)
    }
  };


  Branch.getBranchAdminCount = async function (id, where = {}, req, callback) {
    try {
      var branch = await Branch.findById(id);
      if (branch == null)
        throw Branch.app.err.global.notFound()
      await Branch.app.models.user.checkRoleBranchAdmin(branch.instituteId, id, req)
      where['branchId'] = id

      var admins = await Branch.app.query.towLevel(Branch.app, "branchadmin", "userinstitute", "userInstituteId", "id", where, ["id", "userInstituteId", "branchId", "createdAt"], ["gender", "birthdate", "name", "email"], true)

      callback(null, admins)
    } catch (error) {
      return callback(error)
    }
  };


  Branch.getOneBranch = async function (id, req, callback) {
    try {
      var branch = await Branch.findById(id);
      if (branch == null)
        throw Branch.app.err.global.notFound()
      await Branch.app.models.user.checkRoleBranchAdmin(branch.instituteId, id, req)
      callback(null, branch)
    } catch (error) {
      return callback(error)
    }
  };


  Branch.createNewVenue = async function (id, data, properties = [], imagesId = [], req, callback) {
    try {
      var branch = await Branch.findById(id);
      if (branch == null)
        throw Branch.app.err.global.authorization()
      data.branchId = id
      data.instituteId = branch.instituteId
      await Branch.app.models.user.checkRoleBranchAdmin(branch.instituteId, id, req)
      await Branch.app.dataSources.mainDB.transaction(async models => {
        const {
          venue
        } = models
        const {
          venueProperties
        } = models
        const {
          venueImages
        } = models
        var newVenue = await venue.create(data)
        if (properties.length != 0) {
          properties.forEach(element => {
            element.venueId = newVenue.id
          });
          await venueProperties.create(properties)
        }
        if (properties.imagesId != 0) {
          var imageData = []
          imagesId.forEach(element => {
            imageData.push({
              "venueId": newVenue.id,
              "imageId": element
            })
          });
          await venueImages.create(imageData)
        }
        var newVenue = await venue.findById(newVenue.id)
        callback(null, newVenue)
      })
    } catch (error) {
      callback(error, {})
    }
  };


  Branch.getVenuesBranch = async function (id, filter, req, callback) {
    try {
      var branch = await Branch.findById(id);
      if (branch == null)
        throw Branch.app.err.global.authorization()
      await Branch.app.models.user.checkRoleBranchAdmin(branch.instituteId, id, req)
      if (filter == null) {
        filter = {
          "where": {
            "branchId": id
          }
        }
      } else if (filter.where == null) {
        filter.where = {
          "branchId": id
        }
      } else {
        filter.where.branchId = id
      }
      var venues = await Branch.app.models.venue.find(filter)
      callback(null, venues)
    } catch (error) {
      callback(error)
    }
  };

  Branch.getVenuesBranchCount = async function (id, where, req, callback) {
    try {
      var branch = await Branch.findById(id);
      if (branch == null)
        throw Branch.app.err.global.authorization()
      await Branch.app.models.user.checkRoleBranchAdmin(branch.instituteId, id, req)
      if (where == null) {
        where = {
          "branchId": id
        }
      } else {
        where.branchId = id
      }
      var venuesCount = await Branch.app.models.venue.count(where)
      callback(null, {
        "count": venuesCount
      })
    } catch (error) {
      callback(error)
    }
  };

  Branch.getSessionBranch = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      var branch = await Branch.findById(id);
      if (branch == null)
        throw Branch.app.err.global.authorization()
      await Branch.app.models.user.checkRoleBranchAdmin(branch.instituteId, id, req)
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['course.branchId'] = id

      // var studentInCourse = await Branch.app.query.towLevel(Branch.app, "session", "course", "courseId", "id", filter, false)
      var studentInCourse = await Branch.app.query.multiTowLevel(Branch.app, ["session", "course", "venue"], [{
          "fromTable": 1,
          "fromId": "id",
          "mainTable": 0,
          "mainId": "courseId",
          "relationName": "course"
        },
        {
          "fromTable": 2,
          "fromId": "id",
          "mainTable": 0,
          "mainId": "venueId",
          "relationName": "venue"
        }
      ], filter) // "session", "course", "courseId", "id", filter, false)
      // var studentInCourse = await Course.app.query.towLevel(Branch.app,)
      callback(null, studentInCourse)
    } catch (error) {
      callback(error)
    }
  };

};
