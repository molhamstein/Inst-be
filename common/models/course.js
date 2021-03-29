'use strict';
var async = require("async");

module.exports = function (Course) {

  Course.validatesInclusionOf('typeCost', {
    in: ['course', 'perSession']
  });

  Course.validatesInclusionOf('status', {
    in: ['active', 'pending', 'deactivate']
  });


  Course.createNewPhysicalCourse = async function (data, supplies = [], imagesId = [], req, callback) {
    try {
      await Course.app.models.user.checkRoleBranchAdmin(data.instituteId, data.branchId, req)

      await Course.app.dataSources.mainDB.transaction(async models => {
        const {
          course
        } = models
        const {
          courseImages
        } = models
        const {
          session
        } = models
        const {
          supply
        } = models
        var sessionData = []
        var costSupplies = 0;
        if (supplies.length > 0) {
          for (let index = 0; index < supplies.length; index++) {
            costSupplies += supplies[index].cost
          }
        }
        data.costSupplies = costSupplies

        var newCourse = await course.create(data)
        if (imagesId.length != 0) {
          var imageData = []
          imagesId.forEach(element => {
            imageData.push({
              "imageId": element,
              "courseId": newCourse.id
            })
          });
          await courseImages.create(imageData)
        }
        // sessions.forEach(element => {
        //   sessionData.push({
        //     "venueId": element.venueId,
        //     "startAt": new Date(element.start),
        //     "endAt": addMinutes(new Date(element.start), element.duration),
        //     "courseId": newCourse.id,
        //     "duration": element.duration
        //   })
        // });
        // var sessionHasError = await session.checkSession(sessionData);
        // if (sessionHasError.length > 0) {
        //   throw Course.app.err.course.sessionHasError(sessionHasError);
        // }
        // await session.create(sessionData)
        if (supplies.length > 0) {
          for (let index = 0; index < supplies.length; index++) {
            supplies[index]['courseId'] = newCourse.id
          }
          await supply.create(supplies)
        }
        newCourse = await course.findById(newCourse.id)
        callback(null, newCourse)
      })
    } catch (error) {
      callback(error)
    }
  };


  Course.createNewOnlineCourse = async function (data, req, callback) {
    try {
      let ownerId = req.accessToken.userId;
      await Course.app.dataSources.mainDB.transaction(async models => {
        const {
          course
        } = models
        const {
          courseImages
        } = models
        // const {
        //   session
        // } = models
        // const {
        //   supply
        // } = models
        data['isOnlineCourse'] = true;
        data['ownerId'] = ownerId;
        var newCourse = await course.create(data);
        // if (imagesId.length != 0) {
        //   var imageData = []
        //   imagesId.forEach(element => {
        //     imageData.push({
        //       "imageId": element,
        //       "courseId": newCourse.id
        //     })
        //   });
        //   await courseImages.create(imageData)
        // }
        // sessions.forEach(element => {
        //   sessionData.push({
        //     "venueId": element.venueId,
        //     "startAt": new Date(element.start),
        //     "endAt": addMinutes(new Date(element.start), element.duration),
        //     "courseId": newCourse.id,
        //     "duration": element.duration
        //   })
        // });
        // var sessionHasError = await session.checkSession(sessionData);
        // if (sessionHasError.length > 0) {
        //   throw Course.app.err.course.sessionHasError(sessionHasError);
        // }
        // await session.create(sessionData)
        // if (supplies.length > 0) {
        //   for (let index = 0; index < supplies.length; index++) {
        //     supplies[index]['courseId'] = newCourse.id
        //   }
        //   await supply.create(supplies)
        // }
        newCourse = await course.findById(newCourse.id)
        callback(null, newCourse)
      })
    } catch (error) {
      callback(error)
    }
  };


  Course.updateOnlineCourse = async function (data, units, req, callback) {
    try {
      var youtuberId = req.accessToken.userId;
      await Course.app.dataSources.mainDB.transaction(async models => {
        const {
          course
        } = models
        const {
          unit
        } = models
        const {
          video
        } = models
        const {
          media
        } = models

        let oldCourse;
        if (data.id != null) {
          oldCourse = await course.findById(data.id);
          console.log(youtuberId)
          console.log(oldCourse.youtuberId)
          console.log(oldCourse)
          if (oldCourse == null || oldCourse.youtuberId != youtuberId) {
            throw Course.app.err.global.authorization()
          }
          let updateData = {
            "cost": data.cost,
            "sessionsNumber": data.sessionsNumber,
            "nameEn": data.nameEn,
            "nameAr": data.nameEn,
            "descriptionEn": data.descriptionEn,
            "descriptionAr": data.descriptionEn,
            "whatWillLearn": data.whatWillLearn,
            "courseSegment": data.courseSegment,
            "requirements": data.requirements,
            "duration": element.duration
          }
          await oldCourse.updateAttributes(updateData);
        }
        else {
          data['youtuberId'] = youtuberId;
          data['isStarted'] = true
          data['maxCountStudent'] = 999999999
          data['typeCost'] = "course"
          data['nameAr'] = data.nameEn
          data['descriptionAr'] = data.descriptionEn;
          data["whatWillLearn"] = data.whatWillLearn;
          data["courseSegment"] = data.courseSegment;
          data["requirements"] = data.requirements;
          data["duration"] = data.duration;

          oldCourse = await course.create(data);
        }

        async.forEachOf(units, async function (element, index, unitCallback) {

          let mainUnit;
          console.log(element)
          console.log(element.id)
          if (element.id != null) {
            mainUnit = await unit.findById(element.id);
            await mainUnit.updateAttributes({ "nameEn": element.nameEn, "nameAr": element.nameEn, "videosCount": element.videos ? element.videos.length : 0 })
          }
          else {
            // console.log("SSSSSSs")
            mainUnit = await unit.create({ "courseId": oldCourse.id, "nameEn": element.nameEn, "nameAr": element.nameEn, "videosCount": element.videos ? element.videos.length : 0 })
          }
          // unitCallback()

          async.forEachOf(element.videos, async function (videoElement, index, callback) {
            let mainVideo
            if (videoElement.id != null) {
              mainVideo = await unit.findById(videoElement.id);
              await mainVideo.updateAttributes({ "nameEn": videoElement.nameEn, "nameAr": videoElement.nameEn, "descriptionEn": videoElement.descriptionEn, "descriptionAr": videoElement.descriptionEn, "mediaId": videoElement.mediaId })
            }
            else {
              try {
                let mainMedia = await media.findById(videoElement.mediaId)
                mainVideo = await video.create({ "courseId": oldCourse.id, duration: mainMedia.duration, "unitId": mainUnit.id, "nameEn": videoElement.nameEn, "nameAr": videoElement.nameEn, "descriptionEn": videoElement.descriptionEn, "descriptionAr": videoElement.descriptionEn, "mediaId": videoElement.mediaId })
              }
              catch (error) {
                console.log(error)
              }
            }
          })
        })
        let mainCourse = await course.findById(oldCourse.id);
        callback(null, mainCourse)
      })
    }
    catch (err) {
      callback(err)
    }
  }

  Course.getOneCourse = async function (id, req, callback) {
    try {
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      callback(null, mainCourse)
    } catch (error) {
      callback(error)
    }
  };

  Course.getOnlineCourses = async function (searchKey, code, minPrice, maxPrice, youtuberId, limit, skip, req, callback) {
    try {
      let coursesIds = await Course.app.query.getOnlineCourses(Course.app, searchKey, code, minPrice, maxPrice, youtuberId, limit, skip)
      let courses = await Course.find({ "where": { "id": { "inq": coursesIds } }, "oeder": "createdAt DESC" })
      // let courses = await Course.app.query.threeLevel(Course.app, "course", "youtuber", "user", "youtuberId", "id", "userId", "id", { "where": { "isOnlineCourse": true , "youtuber.user.name":"anas"} }, false)
      callback(null, courses)
    } catch (error) {
      callback(error)
    }
  };

  Course.getOneOnlineCourse = async function (id, req, callback) {
    try {
      let userId
      if (req.accessToken) {
        userId = req.accessToken.userId;
      }
      var mainCourse = await Course.findById(id)
      if (mainCourse == null || !mainCourse.isOnlineCourse)
        throw Course.app.err.notFound.courseNotFound()

      if (userId) {


        let mainYoutuberCourse = await Course.app.models.youtuberCourse.findOne({ "where": { "courseId": id, "youtuberId": userId } })
        if (mainYoutuberCourse) {
          mainCourse = JSON.parse(JSON.stringify(mainCourse))
          mainCourse['isInCourse'] = true;
          let videosWatch = await Course.app.models.videoWatch.find({ "courseId": id });
          for (let indexUnit = 0; indexUnit < mainCourse.units.length; indexUnit++) {
            let videoFinishCount = 0
            const elementUnit = mainCourse.units[indexUnit];
            for (let index = 0; index < elementUnit.videos.length; index++) {
              const element = elementUnit.videos[index];
              let isWatchVideo = videosWatch.find(function (obj) {
                return obj.videoId == element.id;
              });
              if (isWatchVideo) {
                mainCourse['units'][indexUnit]['videos'][index]['isWatchVideo'] = true;
                console.log(mainCourse['units'][indexUnit]['videos'][index])
                videoFinishCount++;
              }
            }
            mainCourse['units'][indexUnit]['videoFinishCount'] = videoFinishCount
          }
        }
      }
      callback(null, mainCourse)

    } catch (error) {
      callback(error)
    }
  };


  Course.startCourse = async function (id, req, callback) {
    try {
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      if (mainCourse.isStarted)
        throw Course.app.err.notFound.courseIsStarted()
      if (mainCourse.typeCost == 'course') {
        let studentInCourse = await Course.app.models.studentCourse.find({
          "where": {
            "courseId": id,
            "isInQueue": false,
          }
        })
        await Promise.all(studentInCourse.map(async (element, index) => {
          let student = element.student()
          let newStudentFrozenBalance = element.frozenBalance - element.cost;
          let newFrozenBalance = 0;
          let newBalance = 0;
          let newStudentBalance = 0;
          if (element.frozenBalance >= element.cost) {
            newFrozenBalance = student.frozenBalance - element.cost
            newBalance = student.balance + element.cost
            newStudentBalance = element.cost
          } else {
            newFrozenBalance = student.frozenBalance - element.frozenBalance
            newBalance = student.balance + element.frozenBalance
            newStudentBalance = element.frozenBalance
          }

          await Course.app.models.transaction.create({
            "instituteId": mainCourse.instituteId,
            "branchId": mainCourse.branchId,
            "courseId": mainCourse.id,
            "studentId": student.id,
            "value": newStudentBalance,
            "type": "receiveCourse"
          })
          await element.updateAttributes({
            "balance": newStudentBalance,
            "frozenBalance": newStudentFrozenBalance
          })
          await student.updateAttributes({
            "balance": newBalance,
            "frozenBalance": newFrozenBalance
          })

        }))
      }
      await mainCourse.updateAttribute("isStarted", true)
      callback(null, mainCourse)
    } catch (error) {
      callback(error)
    }
  };


  Course.editPhysicalCourse = async function (id, data, imagesId, req, callback) {
    try {
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      await Course.app.dataSources.mainDB.transaction(async models => {
        const {
          course
        } = models
        const {
          courseImages
        } = models

        await courseImages.destroyAll({
          "courseId": id,
        })

        if (imagesId.length != 0) {
          var imageData = []
          imagesId.forEach(element => {
            imageData.push({
              "imageId": element,
              "courseId": id
            })
          });
          await courseImages.create(imageData)
        }
        var oldCourse = await course.findById(id)
        var updateData = {
          "cost": data.cost,
          "sessionsNumber": data.sessionsNumber,
          "nameEn": data.nameEn,
          "nameAr": data.nameAr,
          "descriptionEn": data.descriptionEn,
          "descriptionAr": data.descriptionAr,
          "startAt": data.startAt,
          "status": data.status,
          "maxCountStudent": data.maxCountStudent,
          "sessionAvgDuration": data.sessionAvgDuration
        }
        var newCourse = await oldCourse.updateAttributes(updateData)
        callback(null, newCourse)
      })
    } catch (error) {
      callback(error)
    }
  };


  Course.addTeacherToCourse = async function (id, teacherId, typePaid, value, req, callback) {
    try {
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var oldTeacher = await Course.app.models.teacherCourse.findOne({
        "where": {
          "teacherId": teacherId,
          "courseId": id
        }
      })
      if (oldTeacher)
        throw Course.app.err.course.teacherAlreadyInCourse()
      var teacherCourse = await Course.app.models.teacherCourse.create({
        "teacherId": teacherId,
        "typePaid": typePaid,
        "value": value,
        "courseId": id
      })
      var newTeacherCourse = await Course.app.models.teacherCourse.findById(teacherCourse.id)
      callback(null, newTeacherCourse)
    } catch (error) {
      callback(error)
    }
  };


  Course.addSessionToCourse = async function (id, sessions, req, callback) {
    try {
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      await Course.app.dataSources.mainDB.transaction(async models => {
        const {
          session
        } = models
        const {
          studentSession
        } = models
        const {
          studentCourse
        } = models
        var sessionData = []
        sessions.forEach(element => {
          sessionData.push({
            "venueId": element.venueId,
            "startAt": new Date(element.startAt),
            "endAt": addMinutes(new Date(element.startAt), element.duration),
            "courseId": id,
            "name": element.name,
            "cost": element.cost,
            "duration": element.duration
          })
        });
        var sessionHasError = await session.checkSession(sessionData);
        if (sessionHasError.length > 0) {
          throw Course.app.err.course.sessionHasError(sessionHasError);
        }
        var newSessions = await session.create(sessionData)
        var studentInCourse = await studentCourse.find({
          "where": {
            "courseId": id
          }
        })
        var newSessionStudentData = []
        newSessions.forEach(oneSession => {
          studentInCourse.forEach(element => {
            newSessionStudentData.push({
              "sessionId": oneSession.id,
              "studentId": element.studentId,
              "cost": oneSession.cost
            })
          });
        });
        await mainCourse.updateAttribute("hasSession", true)
        await studentSession.create(newSessionStudentData)
        callback(null, mainCourse)
      })
    } catch (error) {
      callback(error)
    }
  };


  Course.getTeacherInCourse = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['courseId'] = id
      if (filter["limit"] == null)
        filter['limit'] = 10
      if (filter["skip"] == null)
        filter['skip'] = 0
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var teacherInCourse = await Course.app.query.threeLevel(Course.app, "teacherCourse", "teacher", "user", "teacherId", "id", "userId", "id", filter, false)

      callback(null, teacherInCourse);
    } catch (error) {
      callback(error)
    }
  };


  Course.getTeacherInCourseCount = async function (id, where = {}, req, callback) {
    try {
      where['courseId'] = id
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var teacherInCourse = await Course.app.query.threeLevel(Course.app, "teacherCourse", "teacher", "user", "teacherId", "id", "userId", "id", where, true)
      callback(null, teacherInCourse);
    } catch (error) {
      callback(error)
    }
  };

  Course.getSessionInCourse = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['courseId'] = id
      // if (filter["limit"] == null)
      //   filter['limit'] = 10
      // if (filter["skip"] == null)
      //   filter['skip'] = 0
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var sessionInCourse = await Course.app.models.session.find(filter)
      callback(null, sessionInCourse)
    } catch (error) {
      callback(error)
    }
  }

  Course.getStudentInCourse = async function (id, filter = {
    "where": {}
  }, req, callback) {
    try {
      if (filter["where"] == null)
        filter['where'] = {}
      filter['where']['courseId'] = id
      if (filter["limit"] == null)
        filter['limit'] = 10
      if (filter["skip"] == null)
        filter['skip'] = 0
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var studentInCourse = await Course.app.query.threeLevel(Course.app, "studentCourse", "student", "user", "studentId", "id", "userId", "id", filter, false)
      callback(null, studentInCourse);
    } catch (error) {
      callback(error)
    }
  };


  Course.getStudentInCourseCount = async function (id, where = {}, req, callback) {
    try {
      where['courseId'] = id
      var mainCourse = await Course.findById(id)
      if (mainCourse == null)
        throw Course.app.err.notFound.courseNotFound()
      await Course.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var studentInCourse = await Course.app.query.threeLevel(Course.app, "studentCourse", "student", "user", "studentId", "id", "userId", "id", where, true)
      callback(null, studentInCourse);
    } catch (error) {
      callback(error)
    }
  };


  Course.cheackFullCourses = function (coursesId) {
    return new Promise(function (resolve, reject) {
      var courseHasError = []
      async.forEachOf(coursesId, function (element, index, callback) {
        cheackFullnOneCourses(element, function (err, data) {
          if (err) reject(err)
          if (data) {
            courseHasError.push({
              "courseId": element
            })
          }
          callback()
        })
      }, function () {
        console.log("Finish loop")
        resolve(courseHasError)
      })
    })
  }

  Course.rateCourseOnline = async function (id, data, req, callback) {
    let userId = req.accessToken.userId
    await Course.app.dataSources.mainDB.transaction(async models => {
      const { course } = models
      const { rate } = models
      let mainCourse = await course.findById(id);
      if (mainCourse == null) {
        throw Course.app.err.global.authorization()
      }
      let mainRate = await rate.findOne({ "where": { "courseId": id, "youtuberId": userId } })
      if (mainRate) {
        throw Course.app.err.global.authorization()
      }
      data['courseId'] = id
      data['youtuberId'] = userId
      mainRate = await rate.create(data);
      let updateData = {
        "rateCount": mainCourse.rateCount + 1,
        "totalRate": mainCourse.totalRate + data.value,
        "avgRate": (mainCourse.totalRate + data.value) / (mainCourse.rateCount + 1),
      }

      switch (data.value) {
        case 5:
          updateData['fiveRate'] = mainCourse['fiveRate'] + 1
          break;
        case 4:
          updateData['foureRate'] = mainCourse['foureRate'] + 1
          break;
        case 3:
          updateData['threeRate'] = mainCourse['threeRate'] + 1
          break;
        case 2:
          updateData['towRate'] = mainCourse['towRate'] + 1
          break;
        case 1:
          updateData['oneRate'] = mainCourse['oneRate'] + 1
          break;

        default:
          break;
      }
      await mainCourse.updateAttributes(updateData)
      callback(null, mainRate)
    })
  }


  function cheackFullnOneCourses(courseId, callback) {
    Course.findById(courseId, function (err, data) {
      if (err) return callback(err)
      if (data.maxCountStudent < data.countStudent + 1)
        callback(null, data)
      else
        callback()
    })
  }


  function addMinutes(date, m) {
    date.setTime(date.getTime() + (m * 60 * 1000));
    return date;
  }


  Course.homePageCourse = async function (callback) {
    try {


      let featuredCategories = await Course.app.models.subCategory.find({ "where": { "isFeatured": true } })
      let featuredCategoriesId = []
      for (let index = 0; index < featuredCategories.length; index++) {
        const element = featuredCategories[index];
        featuredCategoriesId.push(element.id);
      }

      let allCourse = await Course.find({ "where": { subcategoryId: { inq: featuredCategoriesId } }, "order": "createdAt DESC" })


      for (let index = 0; index < allCourse.length; index++) {
        const element = allCourse[index];
        let indexCategory = featuredCategories.findIndex(x => x.id == element.subcategoryId);
        if (featuredCategories[indexCategory]['courses'] == null) {
          featuredCategories[indexCategory]['courses'] = []
        }
        if (featuredCategories[indexCategory]['courses'].length < 10) {
          featuredCategories[indexCategory]['courses'].push(element);
        }
      }

      callback(null, featuredCategories)


    } catch (error) {
      // callback(error)
    }
  }


};
