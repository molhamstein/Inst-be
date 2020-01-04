'use strict';
var g = require('strong-globalize')();
var debug = require('debug')('loopback:user');

module.exports = function (Student) {


  Student.addNewStudent = async function (instituteId, branchId, phonenumber, name, gender, birthdate, req, callback) {
    try {
      await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
      await Student.app.dataSources.mainDB.transaction(async models => {
        const {
          user
        } = models;
        const {
          student
        } = models
        const {
          RoleMapping
        } = models
        const {
          verificationCode
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
          throw Student.app.err.user.phonenumberIsAlreadyUsed()
        }
        var randomPassword = 123456 // generate(6);
        var newStudent = await student.create({
          "userId": userObj.id,
          "instituteId": instituteId,
          "branchId": branchId,
          "password": randomPassword.toString()
        });
        var randomCode = generate(4)
        var verificationCodeObject = {
          "code": randomCode,
          "typeUser": "student",
          "userId": newStudent.id,
          "expiredDate": addHours(new Date(), 2)
        }

        var newVerificationCode = await verificationCode.create(verificationCodeObject);

        var newRoleMapping = await RoleMapping.create({
          "principalType": "student",
          "principalId": newStudent.id,
          "roleId": 3
        })
        var studentId = newStudent.id
        newStudent = await student.findById(studentId)
        callback(null, newStudent)
      })
    } catch (error) {
      callback(error)
    }
  };


  Student.addOldStudent = async function (instituteId, branchId, phonenumber, sentInvitation, req, callback) {
    try {
      await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
      await Student.app.dataSources.mainDB.transaction(async models => {
        const {
          user
        } = models;
        const {
          student
        } = models
        const {
          RoleMapping
        } = models
        const {
          verificationCode
        } = models
        var userObj = await user.findOne({
          "where": {
            "phonenumber": phonenumber
          }
        })
        if (userObj == null) {
          throw Student.app.err.user.userNotFound()
        }

        var userStudent = await student.findOne({
          "where": {
            "userId": userObj.id,
            "instituteId": instituteId,
          }
        })
        if (userStudent) {
          if (sentInvitation)
            throw Student.app.err.user.userInInstituteAlready()
          else
            return callback(null, userStudent)
        }
        var randomPassword = 123456 // generate(6);
        console.log("randomPassword")
        console.log(randomPassword)
        var newStudent = await student.create({
          "userId": userObj.id,
          "instituteId": instituteId,
          "branchId": branchId,
          "password": randomPassword.toString(),
          "sentInvitation": sentInvitation
        });

        if (sentInvitation) {
          var randomCode = generate(4)
          var verificationCodeObject = {
            "code": randomCode,
            "typeUser": "student",
            "userId": newStudent.id,
            "expiredDate": addHours(new Date(), 2)
          }
          var newVerificationCode = await verificationCode.create(verificationCodeObject);
        }
        var newRoleMapping = await RoleMapping.create({
          "principalType": "student",
          "principalId": newStudent.id,
          "roleId": 3
        })
        callback(null, newStudent)
      })
    } catch (error) {
      callback(error)
    }
  }


  Student.login = function (credentials, include, fn) {
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
        }, function (err, student) {
          console.log("student//////////")
          console.log(student)
          student.hasPassword(credentials.password, function (err, isMatch) {
            if (err) {
              debug('An error is reported from User.hasPassword: %j', err);
              fn(defaultError);
            } else if (isMatch) {

              if (student.createAccessToken.length === 2) {
                student.createAccessToken(credentials.ttl, tokenHandler);
              } else {
                student.createAccessToken(credentials.ttl, credentials, tokenHandler);
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


  Student.getStudent = async function (id, req, callback) {
    try {
      var student = await Student.findById(id)
      if (student == null)
        throw Student.app.err.global.notFound()
      await Student.app.models.user.checkRoleInstituteUser(student.instituteId, req)
      callback(null, student)
    } catch (error) {
      callback(error)
    }
  };


  Student.activateStudent = async function (phonenumber, instituteId, code, callback) {
    try {


      var verificationCodeModel = Student.app.models.verificationCode;
      var userModel = Student.app.models.user;

      var user = await userModel.findOne({
        "where": {
          "phonenumber": phonenumber
        }
      })
      if (user == null) {
        throw Student.app.err.user.userNotFound()
      }

      var student = await Student.findOne({
        "where": {
          "userId": user.id,
          "instituteId": instituteId
        }
      })
      code = await verificationCodeModel.findOne({
        "where": {
          "userId": student.id,
          "typeUser": "student",
          "code": code,
          "expiredDate": {
            "gt": new Date()
          }
        }
      })
      if (code == null) {
        throw Student.app.err.user.codeNotFound()
      }

      if (code.status != "active") {
        throw Student.app.err.user.codeNotActive()

      }
      user = await student.updateAttribute("status", "active");
      code = await code.updateAttribute("status", "used");
      callback(null, user)
    } catch (error) {
      callback(error)
    }
  };


  Student.getPackage = async function (id, req, callback) {
    try {
      var student = await Student.findById(id)
      if (student == null)
        throw Student.app.err.global.notFound()
      await Student.app.models.user.checkRoleInstituteUser(student.instituteId, req)
      var packages = await Student.app.models.packageStudent.find({
        "where": {
          "studentId": id
        }
      })
      callback(null, packages)
    } catch (error) {
      callback(error)
    }

  };


  Student.addPaymentToStudent = async function (studentId, value, date, note, courseId, req, callback) {
    try {
      var student = await Student.findById(studentId);
      if (student == null) {
        throw Student.app.err.notFound.studentNotFound()
      }
      await Student.app.models.user.checkRoleInstituteUser(student.instituteId, req)
      await Student.app.dataSources.mainDB.transaction(async models => {
        const {
          studentPayment
        } = models
        const {
          student
        } = models
        const {
          course
        } = models
        const {
          studentCourse
        } = models
        const {
          transaction
        } = models
        var mainStudent = await student.findById(studentId);
        await studentPayment.create({
          "value": value,
          "studentId": studentId,
          "date": date,
          "courseId": courseId,
          "note": note
        })
        var frozenBalance = value + mainStudent.frozenBalance
        if (courseId != null) {
          var mainStudentCourse = await studentCourse.findOne({
            "where": {
              "courseId": courseId,
              "studentId": studentId
            }
          })
          var mainCourse = await course.findById(courseId)
          if (mainStudentCourse.frozenBalance < 0) {
            let debtValue = mainStudentCourse.frozenBalance * -1;
            if (debtValue > value) {
              debtValue = value
            }
            await transaction.create({
              "instituteId": mainCourse.instituteId,
              "branchId": mainCourse.branchId,
              "courseId": mainCourse.id,
              "studentId": studentId,
              "value": debtValue,
              "type": "debtInCourse"
            })
            let balanceCourse = mainStudentCourse.balance + debtValue
            await mainStudentCourse.updateAttribute("balance", balanceCourse)
            var balance = debtValue + mainStudent.balance
            await mainStudent.updateAttribute("balance", balance)
            frozenBalance -= debtValue;
          }
          await mainStudent.updateAttribute("frozenBalance", frozenBalance)
          let frozenBalanceCourse = mainStudentCourse.frozenBalance + value
          await mainStudentCourse.updateAttribute("frozenBalance", frozenBalanceCourse)
        }
        callback(null, mainStudent)
      })
    } catch (error) {
      callback(error)
    }
  }


  Student.receivePaymentToStudent = async function (studentId, value, date, note, courseId, req, callback) {
    try {
      var student = await Student.findById(studentId);
      if (student == null) {
        throw Student.app.err.notFound.studentNotFound()
      }
      await Student.app.models.user.checkRoleInstituteUser(student.instituteId, req)
      await Student.app.dataSources.mainDB.transaction(async models => {
        value = value * -1;
        const {
          studentPayment
        } = models
        const {
          student
        } = models
        const {
          studentCourse
        } = models
        var mainStudent = await student.findById(studentId);
        var frozenBalance = value + mainStudent.frozenBalance
        if (frozenBalance < 0) {
          throw Student.app.err.student.studentDoesnotHaveBalance()
        }

        if (courseId != null) {
          var mainStudentCourse = await studentCourse.find({
            "where": {
              "courseId": courseId,
              "studentId": studentId
            }
          })
          let frozenBalanceCourse = mainStudentCourse.frozenBalance + value
          if (frozenBalanceCourse < 0) {
            throw Student.app.err.course.courseDoesnotHaveBalance()
          }
          await mainStudentCourse.updateAttribute("frozenBalance", frozenBalanceCourse)
        }

        await studentPayment.create({
          "value": value,
          "studentId": studentId,
          "date": date,
          "note": note,
          "courseId": courseId
        })
        await mainStudent.updateAttribute("frozenBalance", frozenBalance)
        callback(null, mainStudent)
      })
    } catch (error) {
      callback(error)
    }
  }


  Student.addToCourses = async function (studentId, courses, req, callback) {
    try {
      var student = await Student.findById(studentId);
      console.log("SSSS");
      if (student == null) {
        throw Student.app.err.notFound.studentNotFound()
      }
      await Student.app.models.user.checkRoleInstituteUser(student.instituteId, req)
      await Student.app.dataSources.mainDB.transaction(async models => {
        const {
          packageStudent
        } = models
        const {
          packageCourse
        } = models
        const {
          studentCourse
        } = models
        const {
          course
        } = models
        var coursesId = []
        courses.forEach(element => {
          coursesId.push(element.id)
        });
        var studenInCourse = await studentCourse.cheackStudentInCourses(studentId, coursesId)
        if (studenInCourse.length > 0)
          throw Student.app.err.course.studentAlreadyInMultiCourse(studenInCourse)
        var courseIsFull = await course.cheackFullCourses(coursesId)
        if (courseIsFull.length > 0)
          throw Student.app.err.course.multiCourseIsFull(courseIsFull)
        // console.log(data)
        // var newPackage = await packageStudent.create(data);
        // var packageCourseData = [];
        // coursesId.forEach(element => {
        //   packageCourseData.push({
        //     "courseId": element,
        //     "packageId": newPackage.id
        //   })
        // });
        // await packageCourse.create(packageCourseData)
        await studentCourse.addStudentToCourses(studentId, coursesId)
        // callback(null, newPackage);
      })
    } catch (error) {
      callback(error)
    }
  };


  Student.makeStudentTransaction = function (studentId, type, value, date, note, fromId, toId, req, callback) {
    Student.receivePaymentToStudent(studentId, value, date, note, fromId, req, function (err, data) {
      if (err) {
        return callback(err)
      }
      Student.addPaymentToStudent(studentId, value, date, note, toId, req, function (err, data) {
        if (err) {
          return callback(err)
        }
        return callback(null, data)
      })
    })
  }



  Student.getStudentCourse = async function (studentId, filter = {
    "where": {}
  }, req, callback) {
    try {
      var student = await Student.findById(studentId);
      if (student == null) {
        throw Student.app.err.notFound.studentNotFound()
      }
      await Student.app.models.user.checkRoleInstituteUser(student.instituteId, req)
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['studentId'] = studentId
      var courses = await Student.app.models.studentCourse.find(filter)
      callback(null, courses)
    } catch (error) {
      callback(error)
    }
  }

  Student.getStudentPayments = async function (studentId, filter = {
    "where": {}
  }, req, callback) {
    try {
      var student = await Student.findById(studentId);
      if (student == null) {
        throw Student.app.err.notFound.studentNotFound()
      }
      await Student.app.models.user.checkRoleInstituteUser(student.instituteId, req)
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['studentId'] = studentId
      var payments = await Student.app.models.studentPayment.find(filter)
      callback(null, payments)
    } catch (error) {
      callback(error)
    }
  }

  function generate(n) {
    var add = 1,
      max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

    if (n > max) {
      return generate(max) + generate(n - max);
    }

    max = Math.pow(10, n + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;

    return number;

  }


  function addHours(date, h) {
    date.setTime(date.getTime() + (h * 60 * 60 * 1000));
    return date;
  }

};
