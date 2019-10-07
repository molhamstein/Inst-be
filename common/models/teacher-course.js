'use strict';

module.exports = function (Teachercourse) {


  Teachercourse.validatesInclusionOf('typePaid', {
    in: ['percentage', 'fixed']
  });


  Teachercourse.addPaymentToTeacher = async function (id, value, note, req, callback) {
    try {
      var teacherCourse = await Teachercourse.findById(id)
      if (teacherCourse == null)
        throw Teachercourse.app.err.global.notFound()
      var mainCourse = await Teachercourse.app.models.Course.findById(teacherCourse.courseId)
      await Teachercourse.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      await Teachercourse.app.dataSources.mainDB.transaction(async models => {
        const {
          teacherCoursePayment
        } = models
        const {
          teacherCourse
        } = models

        var newTeacherCoursePayment = await teacherCoursePayment.create({
          "teacherCourseId": id,
          "value": value,
          "note": note
        })
        var oldTeacherCourse = await teacherCourse.findById(id)
        var newTotalPayment = oldTeacherCourse.totalPayment + value
        var newTeacherCourse = await oldTeacherCourse.updateAttribute("totalPayment", newTotalPayment)
        callback(null, newTeacherCourse)
      })
      callback(null, mainCourse)
    } catch (error) {
      callback(error)
    }
  };


  Teachercourse.getPaymentsForTeacher = async function (id, req, callback) {
    try {
      var teacherCourse = await Teachercourse.findById(id)
      if (teacherCourse == null)
        throw Teachercourse.app.err.global.notFound()
      var mainCourse = await Teachercourse.app.models.Course.findById(teacherCourse.courseId)
      await Teachercourse.app.models.user.checkRoleBranchAdmin(mainCourse.instituteId, mainCourse.branchId, req)
      var teacherPayment = await Teachercourse.app.models.teacherCoursePayment.find({
        "where": {
          "teacherCourseId": id
        }
      })
      callback(null, teacherPayment)
    } catch (error) {
      callback(error)
    }
  };

};
