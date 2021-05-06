'use strict';
var async = require("async");

module.exports = function(Podcast) {
    Podcast.addPodcast = async function(data, onlineSessions, req, callback) {
        try {
            let userId = req.accessToken.userId
            await Podcast.app.dataSources.mainDB.transaction(async models => {
                const {
                    onlineSession
                } = models
                const {
                    podcast
                } = models
                const {
                    media
                } = models
                const {
                    youtuber
                } = models

                data['youtuberId'] = userId;
                data['onlineSessionCount'] = onlineSessions.length;
                let mainYouTuber = await youtuber.findById(userId)
                let mainPodcast = await podcast.create(data);
                let tempTotalPoint = mainYouTuber.totalPoint;
                let tempTotalSessionCreaterTime = mainYouTuber.totalSessionCreaterTime;
                let createrSessionTime = 0;

                for (let index = 0; index < onlineSessions.length; index++) {
                    let element = onlineSessions[index]
                    onlineSessions[index]['podcastId'] = mainPodcast.id;
                    onlineSessions[index]['descriptionAr'] = onlineSessions[index]['descriptionEn'];
                    onlineSessions[index]['nameAr'] = onlineSessions[index]['nameEn'];
                    let mainMedia = await media.findById(element.mediaId);
                    onlineSessions[index]['duration'] = mainMedia.duration;
                    onlineSessions[index]['orderInPodcast'] = index + 1
                    createrSessionTime += mainMedia.duration;
                }
                tempTotalPoint += (parseInt(createrSessionTime / 60) * 10);
                tempTotalSessionCreaterTime += createrSessionTime;
                let levelId = await Podcast.app.service.getLevelId(Podcast.app, tempTotalPoint);

                await mainYouTuber.updateAttributes({ "isPublisher": true, "levelId": levelId, "totalPoint": tempTotalPoint, "totalSessionCreaterTime": tempTotalSessionCreaterTime })
                await onlineSession.create(onlineSessions)

                callback(null, mainPodcast);
            })
        } catch (error) {
            callback(error)
        }
    };

    Podcast.updatePodcast = async function(id, data, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId
            await Podcast.app.dataSources.mainDB.transaction(async models => {
                const {
                    podcast
                } = models

                let oldPodcast = await podcast.findById(id)
                if (oldPodcast == null || oldPodcast.youtuberId != userId) {
                    throw Podcast.app.err.global.authorization()
                }
                let newPodcast = await oldPodcast.updateAttributes(data)
                callback(null, newPodcast);
            })
        } catch (error) {
            callback(error)
        }
    };

    Podcast.addVideoToPodcast = async function(id, data, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId
            await Podcast.app.dataSources.mainDB.transaction(async models => {
                const {
                    onlineSession
                } = models
                const {
                    podcast
                } = models
                const {
                    media
                } = models
                const {
                    youtuber
                } = models
                let mainYouTuber = await youtuber.findById(userId);
                let mainPodcast = await podcast.findById(id);
                if (mainPodcast == null || mainPodcast.youtuberId != userId) {
                    throw Video.app.err.global.authorization()
                }

                let lastOnlineSession = await onlineSession.findOne({ "where": { "podcastId": id }, "order": "orderInPodcast DESC" })
                data['orderInPodcast'] = 1;
                if (lastOnlineSession != null) {
                    data['orderInPodcast'] = lastOnlineSession.orderInPodcast + 1
                }
                let mainMedia = await media.findById(data.mediaId)

                data['podcastId'] = id
                data['descriptionAr'] = data['descriptionEn'];
                data['nameAr'] = data['nameEn'];
                data['duration'] = mainMedia.duration;

                await mainPodcast.updateAttribute("onlineSessionCount", mainPodcast.onlineSessionCount + 1)
                let tempTotalPoint = mainYouTuber.totalPoint + (parseInt(mainMedia.duration / 60) * 10);
                let tempTotalSessionCreaterTime = mainYouTuber.totalSessionCreaterTime + mainMedia.duration;
                let levelId = await Podcast.app.service.getLevelId(Podcast.app, tempTotalPoint);

                await mainYouTuber.updateAttributes({ "levelId": levelId, "totalPoint": tempTotalPoint, "totalSessionCreaterTime": tempTotalSessionCreaterTime });
                let mainVideo = await onlineSession.create(data);
                callback(null, mainVideo)
            })
        } catch (error) {
            callback(error)
        }
    };


    Podcast.subscribePodcast = async function(id, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId
            await Podcast.app.dataSources.mainDB.transaction(async models => {
                const {
                    podcast
                } = models
                const {
                    podcastSubscribe
                } = models
                let mainPodcast = await podcast.findById(id);
                if (mainPodcast == null) {
                    throw Podcast.app.err.global.authorization()
                }
                let mainSubscribePodcast = await podcastSubscribe.findOne({ "where": { "youtuberId": userId, "propertyId": id } })
                if (mainSubscribePodcast == null) {
                    await mainPodcast.updateAttribute("subscriberCount", mainPodcast.subscriberCount + 1)
                    mainSubscribePodcast = await podcastSubscribe.create({ "youtuberId": userId, "podcastId": id })
                }
                callback(null, mainSubscribePodcast)
            })
        } catch (error) {
            callback(error)
        }
    };

    Podcast.unsubscribePodcast = async function(id, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId
            await Podcast.app.dataSources.mainDB.transaction(async models => {
                const {
                    podcast
                } = models
                const {
                    podcastSubscribe
                } = models
                let mainPodcast = await podcast.findById(id);
                if (mainPodcast == null) {
                    throw Podcast.app.err.global.authorization()
                }
                let mainSubscribePodcast = await podcastSubscribe.findOne({ "where": { "youtuberId": userId, "propertyId": id } })
                if (mainSubscribePodcast != null) {
                    await mainPodcast.updateAttribute("subscriberCount", mainPodcast.subscriberCount - 1)
                    await podcastSubscribe.destroyAll({ "youtuberId": userId, "podcastId": id })
                }
                callback(null, "ok")
            })
        } catch (error) {
            callback(error)
        }
    };

    Podcast.getPodcast = async function(searchKey, code, youtuberId, limit, skip, callback) {
        let podcastIds = await Podcast.app.query.getPodcast(Podcast.app, searchKey, code, youtuberId, limit, skip)
        let podcast = await Podcast.find({ "where": { "id": { "inq": podcastIds } } })
        callback(null, podcast)
    }



};