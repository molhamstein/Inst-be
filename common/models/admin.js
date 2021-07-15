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
};