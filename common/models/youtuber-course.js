'use strict';

module.exports = function (Youtubercourse) {
    Youtubercourse.addToOnlineCourse = async function (courseId, context, callback) {
        var userId = context.req.accessToken.userId;
        try {

            await Youtubercourse.app.dataSources.mainDB.transaction(async models => {
                const { youtuber } = models
                const { youtuberCourse } = models
                const { course } = models
                let oldYoutuberCourse = await youtuberCourse.findOne({ "where": { "youtuberId": userId, "courseId": courseId } })
                if (oldYoutuberCourse != null) {
                    throw Youtubercourse.app.err.course.studentAlreadyInMultiCourse([courseId])
                }
                let mainCourse = await course.findById(courseId)
                let newYoutuberCourse = await youtuberCourse.create({ "youtuberId": userId, "cost": mainCourse.cost, courseId })
                callback(null, newYoutuberCourse)
            })
        } catch (error) {
            callback(error)
        }

    }
};
