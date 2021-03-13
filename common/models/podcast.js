'use strict';
var async = require("async");

module.exports = function (Podcast) {
    Podcast.addPodcast = async function (data, videos, req, callback) {
        try {
            let userId = req.accessToken.userId
            await Podcast.app.dataSources.mainDB.transaction(async models => {
                const {
                    video
                } = models
                const {
                    podcast
                } = models
                data['youtuberId'] = userId;
                let mainPodcast = await podcast.create(data);
                videos
                for (let index = 0; index < videos.length; index++) {
                    videos[index]['podcastId'] = mainPodcast.id;
                    videos[index]['descriptionAr'] = videos[index]['descriptionEn'];
                    videos[index]['nameAr'] = videos[index]['nameEn'];
                }
                await video.create(videos)
                callback(null, mainPodcast);
            })
        } catch (error) {
            callback(error)
        }
    };

    Podcast.updatePodcast = async function (id, data, req, callback) {
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

    Podcast.addVideoToPodcast = async function (id, data, req, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            let userId = req.accessToken.userId
            await Podcast.app.dataSources.mainDB.transaction(async models => {
                const {
                    video
                } = models
                const {
                    podcast
                } = models
                let mainPodcast = await podcast.findById(id);
                if (mainPodcast == null || mainPodcast.youtuberId != userId) {
                    throw Video.app.err.global.authorization()
                }
                data['podcastId'] = id
                data['descriptionAr'] = data['descriptionEn'];
                data['nameAr'] = data['nameEn'];

                let mainVideo = await video.create(data);
                callback(null, mainVideo)
            })
        } catch (error) {
            callback(error)
        }
    };


    Podcast.subscribePodcast = async function (id, req, callback) {
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

    Podcast.unsubscribePodcast = async function (id, req, callback) {
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

};
