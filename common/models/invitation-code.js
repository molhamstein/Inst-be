'use strict';

module.exports = function(Invitationcode) {

    Invitationcode.useInvitationCode = async function(code, context, callback) {
        try {
            var userId = context.req.accessToken.userId;
            await Invitationcode.app.dataSources.mainDB.transaction(async models => {
                const {
                    invitationCode
                } = models;
                const {
                    youtuber
                } = models;

                let mainInvitationCode = await invitationCode.findOne({ "where": { "code": code, "status": "active" } });
                if (mainInvitationCode == null) {

                } else {
                    let owner = await youtuber.findById(mainInvitationCode.youtuberId);
                    let user = await youtuber.findById(userId);
                    await mainInvitationCode.updateAttribute("status", "used");
                    let tempTotalPointOwner = owner.totalPoint + 30;
                    let tempTotalPointUser = user.totalPoint + 30;

                    let levelIdOwner = await Invitationcode.app.service.getLevelId(Invitationcode.app, tempTotalPointOwner);
                    let levelIdUser = await Invitationcode.app.service.getLevelId(Invitationcode.app, tempTotalPointUser);

                    await owner.updateAttributes({ "levelId": levelIdOwner, "totalPoint": tempTotalPointOwner })
                    await user.updateAttributes({ "levelId": levelIdUser, "totalPoint": tempTotalPointUser });
                    callback(null, "ok");
                }
            })
        } catch (error) {
            callback(error)
        }
    }
};