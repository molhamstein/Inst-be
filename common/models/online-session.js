'use strict';

module.exports = function(Onlinesession) {
    Onlinesession.watchSession = async function(id, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            await Onlinesession.app.dataSources.mainDB.transaction(async models => {
                const {
                    onlineSession
                } = models
                const {
                    onlineSessionWatch
                } = models

                const {
                    youtuber
                } = models

                let mainSession = await onlineSession.findById(id);
                if (mainSession) {
                    let data = { "reachCount": mainSession.reachCount + 1 }
                    if (req.accessToken) {
                        let userId = req.accessToken.userId
                        let oldVideoWatch = await onlineSessionWatch.findOne({ "where": { "youtuberId": userId, "videoId": id } })
                        if (oldVideoWatch == null) {
                            data['viewCount'] = mainSession.viewCount + 1;
                            let mainYouTuber = await youtuber.findById(userId)
                            await onlineSessionWatch.create({ "youtuberId": userId, "videoId": id })
                            let tempTotalPoint = mainYouTuber.totalPoint + 1;
                            let levelId = await Onlinesession.app.service.getLevelId(Onlinesession.app, mainYouTuber, { "totalPoint": tempTotalPoint });

                            await mainYouTuber.updateAttributes({ "levelId": levelId, "totalPoint": tempTotalPoint });
                        }
                    }
                    await mainSession.updateAttributes(data)
                    callback(null, "ok")
                }
            })
        } catch (error) {
            callback(error)
        }
    };

    Onlinesession.finishSession = async function(id, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId;
            let user = await Onlinesession.app.models.youtuber.findById(userId);
            await Onlinesession.app.dataSources.mainDB.transaction(async models => {
                const {
                    onlineSession
                } = models
                const {
                    onlineSessionWatch
                } = models
                const {
                    youtuber
                } = models

                let mainVideo = await onlineSession.findById(id);
                let mainYouTuber = await youtuber.findById(userId)
                if (mainVideo) {
                    let oldVideoWatch = await onlineSessionWatch.findOne({ "where": { "youtuberId": userId, "videoId": id, "status": "inProgress" }, "order": "createdAt DESC" })
                    if (oldVideoWatch != null) {
                        await oldVideoWatch.updateAttribute("status", "finished");
                        let newUserData = { "totalSessionCount": mainYouTuber.totalSessionCount + 1, "totalSessionTime": mainYouTuber.totalSessionTime + mainVideo.duration };

                        var totalVideoCourse = await onlineSession.find({ "where": { "courseId": mainVideo.courseId } });
                        var totalVideoCourseIds = [];
                        totalVideoCourse.forEach(element => {
                            totalVideoCourseIds.push(element.id);
                        });
                        var totalVideoCourseFinished = await onlineSessionWatch.count({ "youtuberId": userId, "videoId": { "inq": totalVideoCourseIds }, "status": "finished" })
                        if (totalVideoCourseFinished == totalVideoCourse.length) {
                            newUserData['completedCourses'] = mainYouTuber.completedCourses + 1
                        }
                        let levelId = await Onlinesession.app.service.getLevelId(Onlinesession.app, mainYouTuber, { completedCourses: newUserData['completedCourses'] ? newUserData['completedCourses'] : null, "totalSessionTime": mainYouTuber.totalSessionTime + mainVideo.duration });
                        newUserData["levelId"] = levelId;
                        await mainYouTuber.updateAttributes(newUserData);
                    }
                    callback(null, "ok")
                }
            })
        } catch (error) {
            callback(error)
        }
    };


    Onlinesession.deleteOnlineSessionFromPodcast = async function(id, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId
            await Onlinesession.app.dataSources.mainDB.transaction(async models => {
                const {
                    video
                } = models
                const {
                    podcast
                } = models

                let mainVideo = await video.findById(id);
                if (mainVideo == null) {
                    throw Onlinesession.app.err.global.authorization()
                }
                let mainPodcast = await podcast.findById(mainVideo.podcastId);
                if (mainPodcast.youtuberId != userId) {
                    throw Onlinesession.app.err.global.authorization()
                }
                await video.destroyAll({ "id": id })
                callback(null, "ok")
            })
        } catch (error) {
            callback(error)
        }
    };


    Onlinesession.getHomeOnlineSession = async function(callback) {
        let tempOnlineSession = await Onlinesession.app.query.towLevel(Onlinesession.app, "onlineSession", "podcast", "podcastId", "id", { "limit": 20, "where": { "podcast.status": "active" } }, false)
        let onlineSessionIds = [];
        tempOnlineSession.forEach(element => {
            onlineSessionIds.push(element.id)
        });
        let onlineSession = await Onlinesession.find({ "where": { "id": { "inq": onlineSessionIds } }, "order": "createdAt DESC" })
        callback(null, onlineSession)
    }


    Onlinesession.getOnlineSession = async function(id, callback) {
        try {
            let mainOnlineSession = await Onlinesession.findById(id);
            if (mainOnlineSession == null) {
                throw Onlinesession.app.err.global.notFound()
            }
            let data = { "mainSession": mainOnlineSession, "related": [] };
            let nextSession = await Onlinesession.find({
                "where": {
                    "and": [
                        { "podcastId": mainOnlineSession.podcastId },
                        { "orderInPodcast": mainOnlineSession.orderInPodcast + 1 },
                    ]
                }
            })

            let listSessionPodcast = await Onlinesession.find({ "where": { "podcastId": mainOnlineSession.podcastId } })
            data['related'] = data['related'].concat(nextSession);

            let mainPodcast = await mainOnlineSession.podcast();
            let youtuberId = mainPodcast.youtuberId;
            let subcategoryId = mainPodcast.subcategoryId;
            console.log(youtuberId);
            console.log(subcategoryId);

            let onlineSessionIds = [];
            let onlineSessionByYouTuber = await Onlinesession.app.query.queryGenerater(Onlinesession.app, ['onlineSession', 'podcast'], [{
                "fromTable": 1,
                "mainId": "podcastId",
                "fromId": "id",
                "mainTable": 0,
                "relationName": "podcast"
            }], { "where": { "and": [{ "podcast.youtuberId": youtuberId }, { "id": { "neq": id } }] }, "order": "createdAt DESC", "limit": 50 })
            onlineSessionByYouTuber.forEach(element => {
                onlineSessionIds.push(element.id)
            });


            let onlineSessionBySubcategory = await Onlinesession.app.query.queryGenerater(Onlinesession.app, ['onlineSession', 'podcast'], [{
                "fromTable": 1,
                "mainId": "podcastId",
                "fromId": "id",
                "mainTable": 0,
                "relationName": "podcast"
            }], { "where": { "and": [{ "podcast.subcategoryId": subcategoryId }, { "id": { "neq": id } }] }, "order": "createdAt DESC", "limit": 50 })
            onlineSessionBySubcategory.forEach(element => {
                onlineSessionIds.push(element.id)
            });


            let newOnlineSession = await Onlinesession.app.query.towLevel(Onlinesession.app, "onlineSession", "podcast", "podcastId", "id", { "limit": 25, "where": { "podcast.status": "active" } }, false)
            newOnlineSession.forEach(element => {
                if (element.id != id)
                    onlineSessionIds.push(element.id)
            });
            let onlineSession = await Onlinesession.find({ "where": { "id": { "inq": onlineSessionIds } } })
            data['related'] = data['related'].concat(onlineSession);
            data['podcastSession'] = listSessionPodcast
            callback(null, data);
        } catch (error) {
            callback(error)
        }
    }

};