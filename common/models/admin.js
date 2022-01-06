'use strict';

module.exports = function(Admin) {
    Admin.getStatistic = async function(filterLogged = {}, callback) {
        let loggedActiveUser = await Admin.app.query.getLoggedActiveUser(Admin.app, filterLogged);
        let loggedViews = await Admin.app.query.getLoggedViews(Admin.app, filterLogged);
        let loggedUser = await Admin.app.query.getLoggedUser(Admin.app, filterLogged);
        let loggedEnrollCourse = await Admin.app.query.getLoggedEnrollCourse(Admin.app, filterLogged);
        let loggedSubscribePodcast = await Admin.app.query.getLoggedSubscribePodcast(Admin.app, filterLogged);
        let totalCount = {};
        totalCount['youtubers'] = await Admin.app.models.youtuber.count()
        totalCount['courses'] = await Admin.app.models.course.count()
        totalCount['podcasts'] = await Admin.app.models.podcast.count()
        totalCount['views'] = await Admin.app.models.onlineSessionWatch.count()

        callback(null, { totalCount, loggedSubscribePodcast, loggedEnrollCourse, loggedActiveUser, loggedUser, loggedViews });
    }

    Admin.getTransactionsReport = async function(filter = {}, callback) {
        let loggedActiveUser = await Admin.app.query.getTransactionsReport(Admin.app, filter);
        callback(null, loggedActiveUser)
    }



    Admin.getMyNotifications = async function(filter = { "where": {}, limit: 10, skip: 0 }, context, callback) {
        try {
            var userId = context.req.accessToken.userId;
            if (filter.where == null) {
                filter.where = {}
            }
            filter.where.ownerId = userId;
            filter.where.ownerType = "ADMIN";
            let notification = await Admin.app.models.notification.find(filter)
            callback(null, notification);
        } catch (error) {
            callback(error)
        }
    }


    Admin.seenMyNotifications = async function(context, callback) {
        try {
            var userId = context.req.accessToken.userId;
            await Admin.app.models.notification.updateAll({ "ownerId": userId, "ownerType": "ADMIIN" }, { "isSeen": true })
            callback(null, {});
        } catch (error) {
            callback(error)
        }
    }


    Admin.getMyNewNotificationsCount = async function(context, callback) {
        try {
            var userId = context.req.accessToken.userId;
            let notificationCount = await Admin.app.models.notification.count({ "ownerId": userId, "ownerType": "ADMIN", "isSeen": false })
            callback(null, notificationCount);
        } catch (error) {
            callback(error)
        }
    }
};