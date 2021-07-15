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
                let oldYoutuberCourse = await youtuberCourse.findOne({ "where": { "youtuberId": userId, "courseId": courseId } })
                if (oldYoutuberCourse != null) {
                    throw Youtubercourse.app.err.course.studentAlreadyInMultiCourse([courseId])
                }
                let mainCourse = await course.findById(courseId)
                let courseCost = mainCourse.discountCost ? mainCourse.discountCost : mainCourse.cost;
                let newYoutuberCourse = await youtuberCourse.create({ "youtuberId": userId, "cost": courseCost, courseId })
                let courseOwner = mainCourse.youtuber();
                let admin = await youtuber.findOne({ "where": { "email": "gelp@academy.com" } });
                console.log("courseCost")
                console.log(courseCost)
                await mainCourse.updateAttribute("countStudent", mainCourse.countStudent + 1)
                await transaction.create({ "youtuberId": mainCourse.youtuberId, "value": courseCost * courseOwner.percentageCourse / 100, "type": "receiveCourse", courseId: mainCourse.id })
                await transaction.create({ "youtuberId": admin.id, "value": courseCost * (100 - courseOwner.percentageCourse) / 100, "type": "receiveCourse", courseId: mainCourse.id, "isToSystem": true })
                await courseOwner.updateAttribute("balance", courseOwner.balance + (courseCost * courseOwner.percentageCourse / 100))
                await admin.updateAttribute("balance", admin.balance + (courseCost * (100 - courseOwner.percentageCourse) / 100))

                callback(null, newYoutuberCourse)
            })
        } catch (error) {
            callback(error)
        }

    }
};