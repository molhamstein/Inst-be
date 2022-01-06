'use strict';
var async = require("async");

module.exports = function(Course) {

    Course.validatesInclusionOf('typeCost', { in: ['course', 'perSession']
    });

    Course.validatesInclusionOf('status', { in: ['active', 'pending', 'deactivate']
    });


    Course.createNewPhysicalCourse = async function(data, supplies = [], imagesId = [], req, callback) {
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


    Course.createNewOnlineCourse = async function(data, req, callback) {
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

    Course.publishOnlineCourse = async function(id, req, callback) {
        try {

            var youtuberId = req.accessToken.userId;
            await Course.app.dataSources.mainDB.transaction(async models => {
                const {
                    course
                } = models
                const {
                    follower
                } = models

                let oldCourse = await course.findById(id);
                await oldCourse.updateAttribute("status", "active");

                let followerDate = await follower.find({ "where": { "youtuberId": oldCourse.youtuberId } });

                let userData = [];
                followerDate.forEach(element => {
                    userData.push({ "ownerId": element.ownerId, "courseId": id });
                });
                Course.app.models.notification.createGelpNotifications(userData, null, 5)

                callback(null, "ok")
            })
        } catch (err) {
            callback(err)
        }
    }

    Course.updateOnlineCourse = async function(data, units, req, mainCallback) {
        try {
            var youtuberId = data['youtuberId'] ? data['youtuberId'] : req.accessToken.userId;
            await Course.app.dataSources.mainDB.transaction(async models => {
                const {
                    course
                } = models
                const {
                    unit
                } = models
                const {
                    onlineSession
                } = models
                const {
                    media
                } = models
                const {
                    youtuber
                } = models
                const {
                    subCategory
                } = models
                const {
                    youtuberCourse
                } = models
                const {
                    config
                } = models
                const {
                    admin
                } = models
                let mainYouTuber = await youtuber.findById(youtuberId);
                let oldCourse;
                let isNewCourse = true;
                let newSessionIds = [];
                let sessionsNumber = 0;
                let newCourseDuration = 0;
                let createrSessionTime = 0;
                let tempTotalPoint = mainYouTuber.totalPoint;
                units.forEach(element => {
                    sessionsNumber += element.onlineSessions.length
                });

                if (data.id != null) {
                    isNewCourse = false;
                    oldCourse = await course.findById(data.id);
                    console.log(youtuberId)
                    console.log(oldCourse.youtuberId)
                    console.log(oldCourse)
                    if (oldCourse == null || oldCourse.youtuberId != youtuberId) {
                        throw Course.app.err.global.authorization()
                    }

                    let updateData = {
                        "cost": data.cost,
                        "discountCost": data.discountCost,
                        "nameEn": data.nameEn,
                        "nameAr": data.nameEn,
                        "descriptionEn": data.descriptionEn,
                        "descriptionAr": data.descriptionEn,
                        "whatWillLearn": data.whatWillLearn,
                        "courseSegment": data.courseSegment,
                        "imageId": data.imageId,
                        "videoId": data.videoId,
                        "canCreatePromoCode": data.canCreatePromoCode,
                        "unitsNumber": units.length,
                        "requirements": data.requirements,
                        "sessionsNumber": sessionsNumber,
                        "status": data.status ? data.status : oldCourse.status,
                    }
                    await oldCourse.updateAttributes(updateData);
                } else {
                    let mainConfig = await config.findOne({ "where": { "type": "COURSE_PROMO_CODE" } })
                    data['youtuberId'] = data['youtuberId'] ? data['youtuberId'] : youtuberId;
                    data['isStarted'] = true
                    data['maxCountStudent'] = 999999999
                    data['typeCost'] = "course"
                    data['nameAr'] = data.nameEn
                    data['descriptionAr'] = data.descriptionEn;
                    data["whatWillLearn"] = data.whatWillLearn;
                    data["courseSegment"] = data.courseSegment;
                    data["requirements"] = data.requirements;
                    data["duration"] = 0;
                    data['unitsNumber'] = units.length
                    data['sessionsNumber'] = sessionsNumber
                    data["isOnlineCourse"] = true;
                    data["maxUsagePromoCode"] = mainConfig.maxUsage;
                    data["typePromoCode"] = mainConfig.typePromoCode;
                    data["valuePromoCode"] = mainConfig.value;
                    data["validDaysPromoCode"] = mainConfig.validDays;

                    let mainSubcategory = await subCategory.findById(data['subcategoryId'])

                    if (mainSubcategory == null) {
                        throw Podcast.app.err.global.notFound()
                    }
                    let subCategoryTreeCode = []
                    for (let index = 0; index < mainSubcategory.code.length / 3; index++) {
                        subCategoryTreeCode.push(mainSubcategory['code'].slice(0, (index + 1) * 3));
                    }

                    let subcategoryTree = await subCategory.find({ "where": { "code": { "inq": subCategoryTreeCode } } });

                    subcategoryTree.forEach(async(oneSubcategory) => {
                        let newCount = oneSubcategory.courseCount + 1
                        await oneSubcategory.updateAttribute("courseCount", newCount);
                    })

                    oldCourse = await course.create(data);
                }
                // async.forEachOf(units, async function(element, unitIndex, unitCallback) {
                for (var i = 0; i < units.length; i++) {
                    var element = units[i];
                    let mainUnit;
                    if (element.id != null) {
                        mainUnit = await unit.findById(element.id);
                        await mainUnit.updateAttributes({ "nameEn": element.nameEn, "descriptionEn": element.descriptionEn, "descriptionAr": element.descriptionEn, "nameAr": element.nameEn, "onlineSessionsCount": element.onlineSessions ? element.onlineSessions.length : 0 })
                    } else {
                        mainUnit = await unit.create({ "courseId": oldCourse.id, "nameEn": element.nameEn, "nameAr": element.nameEn, "descriptionEn": element.descriptionEn, "descriptionAr": element.descriptionEn, "onlineSessionsCount": element.onlineSessions ? element.onlineSessions.length : 0 })
                    }

                    // async.forEachOf(element.onlineSessions, async function (videoElement, index, callback) {
                    for (var j = 0; j < element.onlineSessions.length; j++) {
                        var videoElement = element.onlineSessions[j];
                        let mainVideo;
                        if (videoElement.id != null) {
                            mainVideo = await onlineSession.findById(videoElement.id);
                            await mainVideo.updateAttributes({ "nameEn": videoElement.nameEn, "nameAr": videoElement.nameEn, "descriptionEn": videoElement.descriptionEn, "descriptionAr": videoElement.descriptionEn, "mediaId": videoElement.mediaId })
                        } else {
                            console.log("QQQQ")
                            let mainMedia = await media.findById(videoElement.mediaId)
                            createrSessionTime += mainMedia.duration;
                            newCourseDuration += mainMedia.duration;
                            mainVideo = await onlineSession.create({ "courseId": oldCourse.id, duration: mainMedia.duration, "unitId": mainUnit.id, "nameEn": videoElement.nameEn, "nameAr": videoElement.nameEn, "descriptionEn": videoElement.descriptionEn, "descriptionAr": videoElement.descriptionEn, "mediaId": videoElement.mediaId })
                            newSessionIds.push(mainVideo.id)
                        }
                    }
                }
                tempTotalPoint += (parseInt(createrSessionTime / 60) * 15);
                let levelId = await Course.app.service.getLevelId(Course.app, mainYouTuber, { "totalPoint": tempTotalPoint, "totalSessionCreaterTime": mainYouTuber.totalSessionCreaterTime + createrSessionTime });

                await mainYouTuber.updateAttributes({ "isPublisher": true, "isTrainer": true, "levelId": levelId, "totalPoint": tempTotalPoint, "totalSessionCreaterTime": mainYouTuber.totalSessionCreaterTime + createrSessionTime });
                await oldCourse.updateAttribute("duration", oldCourse.duration + newCourseDuration)
                let mainCourse = await course.findById(oldCourse.id);
                console.log("Finish")


                if (!isNewCourse && mainCourse.status == "active" && newSessionIds.length != 0) {
                    let youtuberCourseData = await youtuberCourse.find({ "where": { "courseId": mainCourse.id } })
                    let notificationData = []
                    newSessionIds.forEach(onlineSessionId => {
                        youtuberCourseData.forEach(element => {
                            notificationData.push({ "ownerId": element.youtuberId, "onlineSessionId": onlineSessionId, "courseId": mainCourse.id });
                        });
                    });
                    Course.app.models.notification.createGelpNotifications(notificationData, null, 8)

                }

                if (isNewCourse) {
                    let adminUser = await admin.findOne();
                    let userData = [{ "ownerId": adminUser.id, "typeOwner": "ADMIN", "courseId": mainCourse.id }];
                    Course.app.models.notification.createGelpNotifications(userData, null, 9)

                }
                mainCallback(null, mainCourse)

            })


            // })
        } catch (err) {
            mainCallback(err)
        }
    }

    Course.getOneCourse = async function(id, req, callback) {
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

    Course.getOnlineCourses = async function(searchKey, code, minPrice, maxPrice, youtuberId, limit, skip, req, callback) {
        try {
            let userId;
            if (req.accessToken) {
                userId = req.accessToken.userId;
            }
            let coursesIds = await Course.app.query.getOnlineCourses(Course.app, searchKey, code, minPrice, maxPrice, youtuberId, limit, skip)
            let courses = await Course.find({ "where": { "id": { "inq": coursesIds } }, "oeder": "createdAt DESC" })
            courses = await Course.checkIsInCourse(courses, userId)
            callback(null, courses)
        } catch (error) {
            callback(error)
        }
    };

    Course.getOneOnlineCourse = async function(id, req, callback) {
        try {
            let userId
            if (req.accessToken) {
                userId = req.accessToken.userId;
            }
            var mainCourse = await Course.findById(id)
            if (mainCourse == null || !mainCourse.isOnlineCourse)
                throw Course.app.err.notFound.courseNotFound()
            mainCourse['isInCourse'] = false
            mainCourse['finishLessonNumber'] = 0
            mainCourse['nextLesson'] = null;
            mainCourse['isCompleted'] = false;
            mainCourse['rate'] = null;
            mainCourse['promoCode'] = null;



            if (userId) {

                mainCourse['promoCode'] = await Course.app.models.youtuberCoursePromoCode.findOne({ "where": { "courseId": id, "ownerId": userId } })
                mainCourse['rate'] = await Course.app.models.rate.findOne({ "where": { "courseId": id, "youtuberId": userId } })
                let mainYoutuberCourse = await Course.app.models.youtuberCourse.findOne({ "where": { "courseId": id, "youtuberId": userId } })
                if (mainYoutuberCourse || userId == mainCourse.youtuberId) {
                    mainCourse = JSON.parse(JSON.stringify(mainCourse))
                    if (mainCourse.units[0] && mainCourse.units[0].onlineSessions[0]) {
                        mainCourse['nextLesson'] = mainCourse.units[0].onlineSessions[0];
                    }
                    mainCourse['isInCourse'] = true;
                    let onlineSessionWatch = await Course.app.models.onlineSessionWatch.find({ "courseId": id });
                    for (let indexUnit = 0; indexUnit < mainCourse.units.length; indexUnit++) {
                        let onlineSessionFinishCount = 0
                        const elementUnit = mainCourse.units[indexUnit];
                        mainCourse['units'][indexUnit]['isCompletedUnit'] = false
                        for (let index = 0; index < elementUnit.onlineSessions.length; index++) {
                            const element = elementUnit.onlineSessions[index];
                            let isWatchOnlineSession = onlineSessionWatch.find(function(obj) {
                                return obj.videoId == element.id;
                            });
                            if (isWatchOnlineSession) {
                                if (isWatchOnlineSession.status == "finished") {
                                    mainCourse['units'][indexUnit]['onlineSessions'][index]['isWatchOnlineSession'] = true;
                                    onlineSessionFinishCount++;
                                    mainCourse['finishLessonNumber']++
                                        if (mainCourse['units'][indexUnit]['onlineSessions'][index + 1]) {
                                            mainCourse['nextLesson'] = mainCourse['units'][indexUnit]['onlineSessions'][index + 1]
                                        } else
                                    if (mainCourse['units'][indexUnit + 1] && mainCourse['units'][indexUnit + 1]['onlineSessions'][0]) {
                                        mainCourse['nextLesson'] = mainCourse['units'][indexUnit + 1]['onlineSessions'][0]
                                    }
                                } else if (isWatchOnlineSession.status == "inProgress") {
                                    mainCourse['units'][indexUnit]['onlineSessions'][index]['isProgress'] = true;
                                }
                            }
                        }
                        mainCourse['units'][indexUnit]['onlineSessionFinishCount'] = onlineSessionFinishCount
                        if (onlineSessionFinishCount == mainCourse['units'][indexUnit]['onlineSessionsCount']) {
                            mainCourse['units'][indexUnit]['isCompletedUnit'] = true
                        }
                    }
                    if (mainCourse['finishLessonNumber'] == mainCourse['sessionsNumber']) {
                        mainCourse['isCompleted'] = true;
                    }
                } else {
                    mainCourse = JSON.parse(JSON.stringify(mainCourse))
                    for (let indexUnit = 0; indexUnit < mainCourse.units.length; indexUnit++) {
                        const elementUnit = mainCourse.units[indexUnit];
                        for (let index = 0; index < elementUnit.onlineSessions.length; index++) {
                            mainCourse['units'][indexUnit]['onlineSessions'][index]['media'] = {}
                        }
                    }
                }
            } else {
                mainCourse = JSON.parse(JSON.stringify(mainCourse))
                    // mainCourse['units'] = []
                for (let indexUnit = 0; indexUnit < mainCourse.units.length; indexUnit++) {
                    const elementUnit = mainCourse.units[indexUnit];
                    for (let index = 0; index < elementUnit.onlineSessions.length; index++) {
                        mainCourse['units'][indexUnit]['onlineSessions'][index]['media'] = {}
                    }
                }
            }
            callback(null, mainCourse)

        } catch (error) {
            callback(error)
        }
    };


    Course.startCourse = async function(id, req, callback) {
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
                await Promise.all(studentInCourse.map(async(element, index) => {
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


    Course.editPhysicalCourse = async function(id, data, imagesId, req, callback) {
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


    Course.addTeacherToCourse = async function(id, teacherId, typePaid, value, req, callback) {
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


    Course.addSessionToCourse = async function(id, sessions, req, callback) {
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


    Course.getTeacherInCourse = async function(id, filter = {
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


    Course.getTeacherInCourseCount = async function(id, where = {}, req, callback) {
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

    Course.getSessionInCourse = async function(id, filter = {
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

    Course.getStudentInCourse = async function(id, filter = {
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


    Course.getStudentInCourseCount = async function(id, where = {}, req, callback) {
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


    Course.cheackFullCourses = function(coursesId) {
        return new Promise(function(resolve, reject) {
            var courseHasError = []
            async.forEachOf(coursesId, function(element, index, callback) {
                cheackFullnOneCourses(element, function(err, data) {
                    if (err) reject(err)
                    if (data) {
                        courseHasError.push({
                            "courseId": element
                        })
                    }
                    callback()
                })
            }, function() {
                console.log("Finish loop")
                resolve(courseHasError)
            })
        })
    }

    Course.rateCourseOnline = async function(id, data, req, callback) {
        let userId = req.accessToken.userId
        await Course.app.dataSources.mainDB.transaction(async models => {
            const { course } = models
            const { rate } = models
            const { youtuber } = models
            let mainCourse = await course.findById(id);
            if (mainCourse == null) {
                throw Course.app.err.global.authorization()
            }
            let mainYouTuber = await youtuber.findById(mainCourse.youtuberId)
            let tempTotalPoint = mainYouTuber.totalPoint;

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
                    tempTotalPoint += 15
                    break;
                case 4:
                    updateData['foureRate'] = mainCourse['foureRate'] + 1
                    tempTotalPoint += 10
                    break;
                case 3:
                    updateData['threeRate'] = mainCourse['threeRate'] + 1
                    tempTotalPoint += 5
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
            let isPopular = false;
            if (updateData['fiveRate'] > 4) {
                isPopular = true
            }
            let levelId = await Course.app.service.getLevelId(Course.app, mainYouTuber, { "totalPoint": tempTotalPoint });

            await mainYouTuber.updateAttributes({ "isPopular": isPopular, "levelId": levelId, "totalPoint": tempTotalPoint });

            await mainCourse.updateAttributes(updateData)
            mainRate = await rate.findById(mainRate.id);
            callback(null, mainRate)
        })
    }


    function cheackFullnOneCourses(courseId, callback) {
        Course.findById(courseId, function(err, data) {
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


    Course.homePageCourse = async function(req, callback) {
        try {

            let userId;
            if (req.accessToken) {
                userId = req.accessToken.userId;
            }
            let featuredCategories = await Course.app.models.subCategory.find({ "where": { "isFeatured": true } })
            let featuredCategoriesId = []
            for (let index = 0; index < featuredCategories.length; index++) {
                const element = featuredCategories[index];
                featuredCategoriesId.push(element.id);
            }

            let allCourse = await Course.find({ "where": { "status": "active", subcategoryId: { inq: featuredCategoriesId } }, "order": "createdAt DESC" })
            allCourse = await Course.checkIsInCourse(allCourse, userId)


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


    Course.checkIsInCourse = function(courses, userId) {
        return new Promise(function(resolve, reject) {
            let coursesId = []
            if (userId == null) {
                for (let index = 0; index < courses.length; index++) {
                    courses[index].isInCourse = false
                }
                resolve(courses)
            } else {

                courses.forEach(element => {
                    coursesId.push(element.id)
                });

                Course.app.models.youtuberCourse.find({ where: { youtuberId: userId, coursesId: { "inq": coursesId } } }, function(err, allCourseMember) {
                    if (err) {
                        reject(err)
                    }
                    let allCourseMemberId = [];
                    allCourseMember.forEach(element => {
                        allCourseMemberId.push(element.courseId)
                    });

                    for (let index = 0; index < courses.length; index++) {
                        const element = courses[index];
                        if (allCourseMemberId.includes(element.id)) {
                            courses[index].isInCourse = true
                        } else {
                            courses[index].isInCourse = false
                        }
                    }

                    resolve(courses)
                })
            }

        })
    }


    Course.makeCourseCoupon = async function(id, req, callback) {
        try {
            let userId = req.accessToken.userId;
            await Course.app.dataSources.mainDB.transaction(async models => {
                const {
                    course
                } = models
                const {
                    promoCode
                } = models
                let mainCourse = await course.findById(id);
                if (mainCourse == null)
                    throw Course.app.err.notFound.courseNotFound()

                var validDate = new Date();
                validDate.setDate(validDate.getDate() + mainCourse.validDaysPromoCode);
                let code = await Course.app.models.promoCode.getValidPromocode()
                let data = {
                    "code": code,
                    "inviterId": userId,
                    "maxUsage": mainCourse.maxUsagePromoCode,
                    "validDate": validDate,
                    "typeCode": "COUPON",
                    "courseId": id,
                    "type": mainCourse.typePromoCode,
                    "value": mainCourse.valuePromoCode
                }
                let newPromoCode = await promoCode.create(data);
                callback(null, newPromoCode)
            })
        } catch (error) {
            callback(error)
        }
    }


};