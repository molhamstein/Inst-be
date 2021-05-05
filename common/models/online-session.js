'use strict';

module.exports = function(Onlinesession) {
    Onlinesession.watchSession = async function(id, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId
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
                    let oldVideoWatch = await onlineSessionWatch.findOne({ "where": { "youtuberId": userId, "videoId": id } })
                    if (oldVideoWatch == null) {
                        data['viewCount'] = mainSession.viewCount + 1;
                        let mainYouTuber = await youtuber.findById(userId)
                        await onlineSessionWatch.create({ "youtuberId": userId, "videoId": id })
                        let tempTotalPoint = mainYouTuber.totalPoint + 1;
                        await mainYouTuber.updateAttributes({ "totalPoint": tempTotalPoint });
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
                        let newUserData = { "totalSessionTime": mainYouTuber.totalSessionTime + mainVideo.duration };

                        var totalVideoCourse = await onlineSession.find({ "where": { "courseId": mainVideo.courseId } });
                        var totalVideoCourseIds = [];
                        totalVideoCourse.forEach(element => {
                            totalVideoCourseIds.push(element.id);
                        });
                        var totalVideoCourseFinished = await onlineSessionWatch.count({ "youtuberId": userId, "videoId": { "inq": totalVideoCourseIds }, "status": "finished" })
                        if (totalVideoCourseFinished == totalVideoCourse.length) {
                            newUserData['completedCourses'] = mainYouTuber.completedCourses + 1
                        }

                        await mainYouTuber.updateAttributes(newUserData);
                    }
                    callback(null, "ok")
                }
            })
        } catch (error) {
            callback(error)
        }
    };


    Onlinesession.deleteVideoFromPodcast = async function(id, req, callback) {
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

};