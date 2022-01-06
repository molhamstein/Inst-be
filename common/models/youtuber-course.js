'use strict';

module.exports = function(Youtubercourse) {
    Youtubercourse.addToOnlineCourse = async function(courseId, context, callback) {
        var userId = context.req.accessToken.userId;
        try {

            await Youtubercourse.app.dataSources.mainDB.transaction(async models => {
                const { youtuber } = models
                const { transaction } = models
                const { youtuberCourse } = models
                const { course } = models
                const { youtuberCoursePromoCode } = models
                let oldYoutuberCourse = await youtuberCourse.findOne({ "where": { "youtuberId": userId, "courseId": courseId } })
                if (oldYoutuberCourse != null) {
                    throw Youtubercourse.app.err.course.studentAlreadyInMultiCourse([courseId])
                }
                let mainYoutuber = await youtuber.findById(userId)
                let mainCourse = await course.findById(courseId)
                let courseCost = mainCourse.discountCost ? mainCourse.discountCost : mainCourse.cost;
                let newYoutuberCourse = await youtuberCourse.create({ "youtuberId": userId, "cost": courseCost, courseId })
                let courseOwner = mainCourse.youtuber();
                let admin = await youtuber.findOne({ "where": { "email": "gelp@academy.com" } });
                let hasPromoCode = await youtuberCoursePromoCode.findOne({ "where": { "ownerId": userId, courseId } });
                if (hasPromoCode) {
                    if (hasPromoCode.type == "FIXED") {
                        courseCost -= hasPromoCode.value
                    } else if (hasPromoCode.type == "PERCENTAGE") {
                        courseCost -= courseCost * (hasPromoCode.value / 100)
                    }
                }
                if (mainYoutuber.balance < courseCost) {
                    throw Youtubercourse.app.err.student.studentDoesnotHaveBalance()
                }
                await mainCourse.updateAttribute("countStudent", mainCourse.countStudent + 1)
                await transaction.create({ "youtuberId": userId, "value": -courseCost, "type": "receiveCourse", courseId: mainCourse.id })
                await transaction.create({ "youtuberId": mainCourse.youtuberId, "value": courseCost * courseOwner.percentageCourse / 100, "type": "receiveCourse", courseId: mainCourse.id })
                await transaction.create({ "youtuberId": admin.id, "value": courseCost * (100 - courseOwner.percentageCourse) / 100, "type": "receiveCourse", courseId: mainCourse.id, "isToSystem": true })
                await mainYoutuber.updateAttribute("balance", mainYoutuber.balance - courseCost)
                await courseOwner.updateAttribute("balance", courseOwner.balance + (courseCost * courseOwner.percentageCourse / 100))
                await admin.updateAttribute("balance", admin.balance + (courseCost * (100 - courseOwner.percentageCourse) / 100))

                callback(null, newYoutuberCourse)
            })
        } catch (error) {
            callback(error)
        }

    }
};