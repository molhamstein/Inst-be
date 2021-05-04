'use strict';

module.exports = function(Follower) {

    Follower.makeFollow = async function(id, req, callback) {
        let userId = req.accessToken.userId;
        let hasFollow = await Follower.findOne({ "where": { "ownerId": userId, "youtuberId": id } })
        if (hasFollow != null) {
            var err = new Error('allready following');
            err.statusCode = 603;
            err.code = 'ALREADY_FOLLOWING';
            return callback(err);
        }
        let owner = await Follower.app.models.youtuber.findById(userId);

        let following = owner.following + 1;
        await owner.updateAttribute("following", following);
        let user = await Follower.app.models.youtuber.findById(id);

        let tempTotalPoint = user.totalPoint + 15;
        let follower = user.follower + 1;
        await user.updateAttributes({ "follower": follower, "totalPoint": tempTotalPoint });
        let newFollow = await Follower.create({ "youtuberId": id, ownerId: owner.id })
        callback(null, newFollow)
    }


    // Follower.remoteMethod();

    Follower.makeUnfollow = async function(id, req, callback) {
        let userId = req.accessToken.userId;
        let hasFollow = await Follower.findOne({ "where": { "ownerId": userId, "youtuberId": id } })
        if (hasFollow == null) {
            var err = new Error('not following');
            err.statusCode = 602;
            err.code = 'NOT_FOLLOWING';
            return callback(err);
        }
        let owner = await Follower.app.models.youtuber.findById(userId);
        let data = {}

        let user = await Follower.app.models.youtuber.findById(id);

        let follower = user.follower - 1;
        let tempTotalPoint = user.totalPoint - 15;
        await user.updateAttributes({ "follower": follower, "totalPoint": tempTotalPoint });

        // await user.updateAttribute("follower", follower);

        data = { "following": owner.following - 1 }
        await owner.updateAttributes(data);
        await Follower.destroyAll({ youtuberId: id, ownerId: owner.id })
        callback(null, {})
    }

};