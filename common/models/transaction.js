'use strict';

module.exports = function(Transaction) {
    Transaction.validatesInclusionOf('type', { in: ['receiveCourseSupplies', 'receiveCourse', 'receiveSession', 'debtInCourse', 'paidTeacherCourse', 'invitation']
    });

    Transaction.getCourseTransactions = async function(courseId, filter = {
        "where": {}
    }, req, callback) {
        try {
            if (filter["where"] == null)
                filter['where'] = {}
            filter['where']['courseId'] = courseId
            if (filter["limit"] == null)
                filter['limit'] = 10
            if (filter["skip"] == null)
                filter['skip'] = 0
            var mainCourse = await Transaction.app.models.Course.findById(courseId)
            if (mainCourse == null)
                throw Transaction.app.err.notFound.courseNotFound()
            await Transaction.app.models.user.checkRoleInstituteUser(mainCourse.instituteId, req)

            var transactions = await Transaction.find(filter)
            callback(null, transactions);
        } catch (error) {
            callback(error)
        }
    }


    Transaction.getSessionTransactions = async function(sessionId, filter = {
        "where": {}
    }, req, callback) {
        try {
            if (filter["where"] == null)
                filter['where'] = {}
            filter['where']['sessionId'] = sessionId
            if (filter["limit"] == null)
                filter['limit'] = 10
            if (filter["skip"] == null)
                filter['skip'] = 0
            var mainSession = await Transaction.app.models.Session.findById(sessionId)
            if (mainSession == null)
                throw Transaction.app.err.notFound.sessionNotFound()
            var mainCourse = await Transaction.app.models.Course.findById(courseId)
            await Transaction.app.models.user.checkRoleInstituteUser(mainCourse.instituteId, req)

            var transactions = await Transaction.find(filter)
            callback(null, transactions);
        } catch (error) {
            callback(error)
        }
    }

    Transaction.getStudentTransactions = async function(studentId, filter = {
        "where": {}
    }, req, callback) {
        try {
            if (filter["where"] == null)
                filter['where'] = {}
            filter['where']['studentId'] = studentId
            if (filter["limit"] == null)
                filter['limit'] = 10
            if (filter["skip"] == null)
                filter['skip'] = 0
            var mainStudent = await Transaction.app.models.Student.findById(studentId)
            if (mainStudent == null)
                throw Transaction.app.err.notFound.studentNotFound()
            await Transaction.app.models.user.checkRoleInstituteUser(mainStudent.instituteId, req)

            var transactions = await Transaction.find(filter)
            callback(null, transactions);
        } catch (error) {
            callback(error)
        }
    }

    Transaction.getTeacherTransactions = async function(teacherId, filter = {
        "where": {}
    }, req, callback) {
        try {
            if (filter["where"] == null)
                filter['where'] = {}
            filter['where']['teacherId'] = teacherId
            if (filter["limit"] == null)
                filter['limit'] = 10
            if (filter["skip"] == null)
                filter['skip'] = 0
            var mainTeacher = await Transaction.app.models.Teacher.findById(teacherId)
            if (mainTeacher == null)
                throw Transaction.app.err.notFound.teacherNotFound()
            await Transaction.app.models.user.checkRoleInstituteUser(mainTeacher.instituteId, req)

            var transactions = await Transaction.find(filter)
            callback(null, transactions);
        } catch (error) {
            callback(error)
        }
    }


};