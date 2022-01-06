'use strict';

module.exports = function(Promocode) {


    // Promocode.validatesInclusionOf('type', { in: ['PERCENTAGE', 'FIXED']
    // });
    Promocode.validatesInclusionOf('typeCode', { in: ['INVITATION', 'COUPON']
    });


    Promocode.makeInvitationCoupon = async function(req, callback) {
        try {
            let userId = req.accessToken.userId;
            let configInvitation = await Promocode.app.models.config.findOne({ "where": { "type": "INVITATION" } });
            console.log(configInvitation)
            var validDate = new Date();
            validDate.setDate(validDate.getDate() + configInvitation.validDays);
            let code = await Promocode.getValidPromocode()
            console.log("code")
            console.log(code)
            let data = {
                "code": code,
                "inviterId": userId,
                "maxUsage": configInvitation.maxUsage,
                "validDate": validDate,
                "typeCode": "INVITATION",
                "inviterBalance": configInvitation.inviterBalance,
                "userBalance": configInvitation.userBalance
            }
            let newPromoCode = await Promocode.create(data);
            callback(null, newPromoCode)
        } catch (error) {
            callback(error)
        }
    }


    Promocode.getValidPromocode = function() {
        return new Promise(async function(resolve, reject) {
            let isValid = false;
            let result = '';
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            while (!isValid) {
                result = ''
                for (var i = 0; i < 6; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }

                let hasSamePromoCode = await Promocode.findOne({ "where": { "code": result, "validDate": { "gte": new Date() } } })
                if (hasSamePromoCode == null) {
                    isValid = true;
                    resolve(result);
                }
            }
        })

    }


    Promocode.checkValidPromocode = async function(code, req, callback) {
        try {
            let userId = req.accessToken.userId;
            await Promocode.app.dataSources.mainDB.transaction(async models => {
                const {
                    promoCode
                } = models
                const {
                    transaction
                } = models
                const {
                    youtuber
                } = models
                const {
                    youtuberCoursePromoCode
                } = models
                let mainPromoCode = await promoCode.findOne({ "where": { code, validDate: { "gte": new Date() } } });
                if (mainPromoCode == null || mainPromoCode.currentUsage >= mainPromoCode.maxUsage) {
                    throw Promocode.app.err.Promocode.notValidPromocode()
                }
                if (mainPromoCode.typeCode == "INVITATION") {
                    let user = await youtuber.findById(userId);
                    if (user) {
                        await user.updateAttribute("balance", user.balance + mainPromoCode.userBalance);
                        Promocode.app.models.notification.createGelpNotifications([{}], userId, 5)
                        await transaction.create({ "youtuberId": userId, "value": mainPromoCode.userBalance, "type": "invitation" })
                    }

                    let inviter = await youtuber.findById(mainPromoCode.inviterId);
                    if (inviter) {
                        await inviter.updateAttribute("balance", inviter.balance + mainPromoCode.inviterBalance);
                        Promocode.app.models.notification.createGelpNotifications([{}], mainPromoCode.inviterId, 5)
                        await transaction.create({ "youtuberId": mainPromoCode.inviterId, "value": mainPromoCode.inviterBalance, "type": "invitation" })
                    }
                } else if (mainPromoCode.typeCode == "COUPON") {
                    let promoCodeData = [
                        { "reason": "ACCEPT_INVITATION", "youtuberId": userId, "promoCodeId": mainPromoCode.id, "courseId": mainPromoCode.courseId, "type": mainPromoCode.type, "value": mainPromoCode.value, "ownerId": mainPromoCode.inviterId },
                        { "reason": "INVITATION", "youtuberId": mainPromoCode.inviterId, "promoCodeId": mainPromoCode.id, "courseId": mainPromoCode.courseId, "type": mainPromoCode.type, "value": mainPromoCode.value, "ownerId": userId }
                    ]
                    Promocode.app.models.notification.createGelpNotifications([{ "courseId": mainPromoCode.courseId }], userId, 6)
                    Promocode.app.models.notification.createGelpNotifications([{ "courseId": mainPromoCode.courseId }], mainPromoCode.inviterId, 6)

                    await youtuberCoursePromoCode.create(promoCodeData)
                }
                callback(null, mainPromoCode)
            })
        } catch (error) {
            callback(error)
        }
    }


};