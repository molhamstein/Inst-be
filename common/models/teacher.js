'use strict';

module.exports = function (Teacher) {


  Teacher.addNewTeacher = async function (instituteId, password, phonenumber, name, gender, birthdate, req, callback) {
    try {
      await Teacher.app.models.user.checkRoleInstituteAdmin(instituteId, req)
      await Teacher.app.dataSources.mainDB.transaction(async models => {
        const {
          user
        } = models;
        const {
          teacher
        } = models
        const {
          RoleMapping
        } = models
        var userObj = await user.findOne({
          "where": {
            "phonenumber": phonenumber
          }
        })
        if (userObj == null) {
          userObj = await user.create({
            "phonenumber": phonenumber,
            "name": name,
            "gender": gender,
            "birthdate": birthdate,
            "email": null
          })
        } else {
          throw Teacher.app.err.user.phonenumberIsAlreadyUsed()
        }
        var newTeacher = await teacher.create({
          "userId": userObj.id,
          "instituteId": instituteId,
          "password": password
        });

        var newRoleMapping = await RoleMapping.create({
          "principalType": "teacher",
          "principalId": newTeacher.id,
          "roleId": 4
        })
        callback(null, newTeacher)
      })
    } catch (error) {
      callback(error)
    }
  };


  Teacher.addOldTeacher = async function (instituteId, password, phonenumber, req, callback) {
    try {
      await Teacher.app.models.user.checkRoleInstituteAdmin(instituteId, req)
      await Teacher.app.dataSources.mainDB.transaction(async models => {
        const {
          user
        } = models;
        const {
          teacher
        } = models
        const {
          RoleMapping
        } = models
        var userObj = await user.findOne({
          "where": {
            "phonenumber": phonenumber
          }
        })
        if (userObj == null) {
          throw Teacher.app.err.user.userNotFound()
        }

        var userTeacher = await teacher.findOne({
          "where": {
            "userId": userObj.id,
            "instituteId": instituteId,
          }
        })
        if (userTeacher) {
          throw Teacher.app.err.user.userInInstituteAlready()
        }
        var newTeacher = await teacher.create({
          "userId": userObj.id,
          "instituteId": instituteId,
          "password": password
        });


        var newRoleMapping = await RoleMapping.create({
          "principalType": "teacher",
          "principalId": newTeacher.id,
          "roleId": 3
        })
        callback(null, newTeacher)
      })
    } catch (error) {
      callback(error)
    }
  }


  Teacher.login = function (credentials, include, fn) {
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
      phonenumber: credentials.phonenumber
    }

    if (!query.phonenumber) {
      var err2 = new Error(g.f('{{phonenumber}} is required'));
      err2.statusCode = 400;
      err2.code = 'PHONENUMBER_REQUIRED';
      fn(err2);
      return fn.promise;
    }

    if (!credentials.instituteId) {
      var err2 = new Error(g.f('{{instituteId}} is required'));
      err2.statusCode = 400;
      err2.code = 'INSTITEID_ID_REQUIRED';
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
            userId: user.userId,
            instituteId: credentials.instituteId
          }
        }, function (err, teacher) {
          console.log("teacher//////////")
          console.log(teacher)
          teacher.hasPassword(credentials.password, function (err, isMatch) {
            if (err) {
              debug('An error is reported from User.hasPassword: %j', err);
              fn(defaultError);
            } else if (isMatch) {

              if (teacher.createAccessToken.length === 2) {
                teacher.createAccessToken(credentials.ttl, tokenHandler);
              } else {
                teacher.createAccessToken(credentials.ttl, credentials, tokenHandler);
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


  Teacher.changeSubcategory = async function (id, subcategoryId, req, callback) {
    try {
      var teacher = await Teacher.findById(id)
      if (teacher == null)
        throw Teacher.app.err.global.notFound()
      await Teacher.app.models.user.checkRoleInstituteAdmin(teacher.instituteId, req)
      await Teacher.app.dataSources.mainDB.transaction(async models => {
        const {
          teacher
        } = models;
        const {
          teacherSubcategory
        } = models;
        await teacherSubcategory.destroyAll({
          "teacherID": id,
        })

        var subcategoryData = []
        subcategoryId.forEach(element => {
          subcategoryData.push({
            "teacherId": id,
            "subcategoryId": element
          })
        });
        await teacherSubcategory.create(subcategoryData)
        var newTeacher = await teacher.findById(id)
        callback(null, newTeacher)
      })
    } catch (error) {
      callback(error)
    }
  };


  Teacher.getTeacher = async function (id, req, callback) {
    try {
      var teacher = await Teacher.findOne({
        "where": {
          "id": id
        },
        "include": "subCategories"
      })
      if (teacher == null)
        throw Teacher.app.err.global.notFound()
      await Teacher.app.models.user.checkRoleInstituteUser(teacher.instituteId, req)
      callback(null, teacher)
    } catch (error) {
      callback(error)
    }
  };


  Teacher.getTeacherPayments = async function (teacherId, filter = {
    "where": {}
  }, req, callback) {
    try {
      var teacher = await Teacher.findById(teacherId);
      if (teacher == null) {
        throw Teacher.app.err.notFound.teacherNotFound()
      }
      await Teacher.app.models.user.checkRoleInstituteUser(teacher.instituteId, req)
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['teacherId'] = teacherId
      var payments = await Teacher.app.models.teacherPayment.find(filter)
      callback(null, payments)
    } catch (error) {
      callback(error)
    }
  }


  Teacher.addPaymentToTeacher = async function (id, value, courseId, sessionId, note, date, req, callback) {
    try {
      await Teacher.app.dataSources.mainDB.transaction(async models => {
        const {
          teacher
        } = models
        const {
          teacherPayment
        } = models
        const {
          teacherCourse
        } = models
        const {
          course
        } = models
        const {
          transaction
        } = models


        var mainTeacher = await teacher.findById(id)
        if (mainTeacher == null)
          throw Teacher.app.err.notFound.teacherNotFound()
        var mainCourse = await course.findById(courseId)
        if (mainCourse == null)
          throw Teacher.app.err.notFound.courseNotFound()
        await Teacher.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)

        var newTeacherPayment = await teacherPayment.create({
          "teacherId": id,
          "courseId": courseId,
          "sessionId": sessionId,
          "date": date,
          "value": value,
          "note": note
        })
        var oldTeacherCourse = await teacherCourse.findOne({
          "where": {
            "courseId": courseId,
            "teacherId": id
          }
        })
        var newBalance = oldTeacherCourse.balance + value
        var newTeacherCourse = await oldTeacherCourse.updateAttribute("balance", newBalance)
        var newTeacherBalance = mainTeacher.balance + value
        var newTeacher = await mainTeacher.updateAttribute("balance", newTeacherBalance)

        await transaction.create({
          "instituteId": mainCourse.instituteId,
          "branchId": mainCourse.branchId,
          "courseId": mainCourse.id,
          "sessionId": sessionId,
          "teacherId": id,
          "value": value * -1,
          "type": "paidTeacherCourse"
        })
        callback(null, newTeacher)
      })
    } catch (error) {
      callback(error)
    }
  };


  Teacher.getTeacherCourse = async function (teacherId, filter = {
    "where": {}
  }, req, callback) {
    try {
      var teacher = await Teacher.findById(teacherId);
      if (teacher == null) {
        throw Teacher.app.err.notFound.teacherNotFound()
      }
      await Teacher.app.models.user.checkRoleInstituteUser(teacher.instituteId, req)
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['teacherId'] = teacherId
      var courses = await Teacher.app.models.teacherCourse.find(filter)
      callback(null, courses)
    } catch (error) {
      callback(error)
    }
  }



  Teacher.getTeacherNotes = async function (teacherId, filter = {
    "where": {}
  }, req, callback) {
    try {
      var teacher = await Teacher.findById(teacherId);
      if (teacher == null) {
        throw Teacher.app.err.notFound.teacherNotFound()
      }
      await Teacher.app.models.user.checkRoleInstituteUser(teacher.instituteId, req)
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['teacherId'] = teacherId
      var notes = await Teacher.app.models.teacherNote.find(filter)
      callback(null, notes)
    } catch (error) {
      callback(error)
    }
  }



  Teacher.getTeacherNotesCount = async function (teacherId, where = {}, req, callback) {
    try {
      var teacher = await Teacher.findById(teacherId);
      if (teacher == null) {
        throw Teacher.app.err.notFound.teacherNotFound()
      }
      await Teacher.app.models.user.checkRoleInstituteUser(teacher.instituteId, req)
      where['teacherId'] = teacherId
      var countNotes = await Teacher.app.models.teacherNote.count(where)
      callback(null, {
        "count": countNotes
      })
    } catch (error) {
      callback(error)
    }
  }

  Teacher.addNoteToTeacher = async function (teacherId, data, req, callback) {
    try {
      var teacher = await Teacher.findById(teacherId);
      if (teacher == null) {
        throw Teacher.app.err.notFound.teacherNotFound()
      }
      await Teacher.app.models.user.checkRoleInstituteUser(teacher.instituteId, req)
      data['teacherId'] = teacherId
      var note = await Teacher.app.models.teacherNote.create(data)
      callback(null, note)
    } catch (error) {
      callback(error)
    }
  }


};
