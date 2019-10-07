'use strict';

module.exports = function (Waitingliststudent) {


  Waitingliststudent.removeStudentFromWaitingList = async function (id, req, callback) {
    try {
      var studentInWaitingList = await Waitingliststudent.findById(id)
      if (studentInWaitingList == null)
        throw Waitingliststudent.app.err.global.notFound()
      var student = await studentInWaitingList.student()
      await Waitingliststudent.app.models.user.checkRoleInstituteUser(student.instituteId, req)
      await Waitingliststudent.destroyById(id)
      callback(null, {
        "status": "ok"
      });
    } catch (error) {
      callback(error)
    }
  };
};
