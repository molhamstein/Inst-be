'use strict';

module.exports = function(Video) {
    Video.watchVideo = async function(id, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId
            await Video.app.dataSources.mainDB.transaction(async models => {
                const {
                    video
                } = models
                const {
                    videoWatch
                } = models

                let mainVideo = await video.findById(id);
                if (mainVideo) {
                    let data = { "reachCount": mainVideo.reachCount + 1 }
                    let oldVideoWatch = await videoWatch.findOne({ "where": { "youtuberId": userId, "videoId": id } })
                    if (oldVideoWatch == null) {
                        data['viewCount'] = mainVideo.viewCount + 1;
                        await videoWatch.create({ "youtuberId": userId, "videoId": id })
                    }
                    await mainVideo.updateAttributes(data)
                    callback(null, "ok")
                }
            })
        } catch (error) {
            callback(error)
        }
    };

    Video.finishVideo = async function(id, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId
            await Video.app.dataSources.mainDB.transaction(async models => {
                const {
                    video
                } = models
                const {
                    videoWatch
                } = models

                let mainVideo = await video.findById(id);
                if (mainVideo) {
                    let oldVideoWatch = await videoWatch.findOne({ "where": { "youtuberId": userId, "videoId": id, "status": "inProgress" }, "order": "createdAt DESC" })
                    if (oldVideoWatch == null) {
                        await videoWatch.create({ "youtuberId": userId, "videoId": id, "status": "finished" })
                    } else {
                        await oldVideoWatch.updateAttribute("status", "finished")
                    }
                    callback(null, "ok")
                }
            })
        } catch (error) {
            callback(error)
        }
    };

    Video.deleteVideoFromPodcast = async function(id, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId
            await Video.app.dataSources.mainDB.transaction(async models => {
                const {
                    video
                } = models
                const {
                    podcast
                } = models

                let mainVideo = await video.findById(id);
                if (mainVideo == null) {
                    throw Video.app.err.global.authorization()
                }
                let mainPodcast = await podcast.findById(mainVideo.podcastId);
                if (mainPodcast.youtuberId != userId) {
                    throw Video.app.err.global.authorization()
                }
                await video.destroyAll({ "id": id })
                callback(null, "ok")
            })
        } catch (error) {
            callback(error)
        }
    };

};