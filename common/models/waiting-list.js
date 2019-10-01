'use strict';

module.exports = function (Waitinglist) {


  Waitinglist.addStudentToWaitingList = async function (id, studentId, branchId, note, req, callback) {
    try {
      var waitingList = await Waitinglist.findById(id)
      if (waitingList == null)
        throw Waitinglist.app.err.global.notFound()
      var student = await Waitinglist.app.models.Student.findById(studentId)
      if (student == null)
        throw Waitinglist.app.err.global.notFound()

      if (waitingList.instituteId != student.instituteId)
        throw Waitinglist.app.err.global.authorization()
      await Waitinglist.app.models.user.checkRoleInstituteUser(waitingList.instituteId, req)

      var oldStudentInWaitingList = await Waitinglist.app.models.waitingListStudent.findOne({
        "where": {
          "studentId": studentId,
          "waitingListId": id
        }
      })
      if (oldStudentInWaitingList != null)
        throw Waitinglist.app.err.waitingList.studentInwaitingListlready()
      await Waitinglist.app.dataSources.mainDB.transaction(async models => {
        const {
          waitingListStudent
        } = models
        const {
          waitingList
        } = models
        var newStudentInWaitingList = await waitingListStudent.create({
          "studentId": studentId,
          "branchId": branchId,
          "note": note,
          "waitingListId": id
        })
        var newWaitingList = await waitingList.findById(id)
        var count = newWaitingList.count + 1
        await newWaitingList.updateAttribute("count", count)
        callback(null, newStudentInWaitingList)
      })
    } catch (error) {
      callback(error)
    }
  };
  

  Waitinglist.getStudentForwaitingList = async function (id, req, callback) {

    try {
      var waitingList = await Waitinglist.findById(id)
      if (waitingList == null)
        throw Waitinglist.app.err.global.notFound()
      await Waitinglist.app.models.user.checkRoleInstituteUser(waitingList.instituteId, req)
      var students = await Waitinglist.app.models.waitingListStudent.find({
        "where": {
          "waitingListId": id
        }
      })
      callback(null, students)
    } catch (error) {
      callback(error)
    }
  };
};
