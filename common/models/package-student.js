'use strict';

module.exports = function (Packagestudent) {


  Packagestudent.createPackage = async function (data, coursesId, req, callback) {
    try {
      var student = await Packagestudent.app.models.student.findById(data.studentId);
      if (student == null) {
        throw Packagestudent.app.err.notFound.studentNotFound()
      }
      await Packagestudent.app.models.user.checkRoleInstituteUser(student.instituteId, req)
      await Packagestudent.app.dataSources.mainDB.transaction(async models => {
        const {
          packageStudent
        } = models
        const {
          packageCourse
        } = models
        const {
          studentCourse
        } = models
        const {
          course
        } = models
        var studenInCourse = await studentCourse.cheackStudentInCourses(data.studentId, coursesId)
        if (studenInCourse.length > 0)
          throw Packagestudent.app.err.course.studentAlreadyInMultiCourse(studenInCourse)
        var courseIsFull = await course.cheackFullCourses(coursesId)
        if (courseIsFull.length > 0)
          throw Packagestudent.app.err.course.multiCourseIsFull(courseIsFull)
        console.log(data)
        var newPackage = await packageStudent.create(data);
        var packageCourseData = [];
        coursesId.forEach(element => {
          packageCourseData.push({
            "courseId": element,
            "packageId": newPackage.id
          })
        });
        await packageCourse.create(packageCourseData)
        await studentCourse.addStudentToCourses(data.studentId, coursesId)
        callback(null, newPackage);
      })
    } catch (error) {
      callback(error)
    }
  };


  Packagestudent.addPaymentToPackage = async function (id, value, note, req, callback) {
    try {
      var packageStudent = await Packagestudent.findById(id)
      if (packageStudent == null)
        throw Packagestudent.app.err.global.notFound()
      var student = await Packagestudent.app.models.student.findById(packageStudent.studentId)
      await Packagestudent.app.models.user.checkRoleInstituteUser(student.instituteId, req)
      await Packagestudent.app.dataSources.mainDB.transaction(async models => {
        const {
          packageStudent
        } = models
        const {
          packageStudentPayment
        } = models

        await packageStudentPayment.create({
          "value": value,
          "note": note,
          "packageId": id
        })
        var oldPackage = await packageStudent.findById(id)
        var newTotalPayment = oldPackage.totalPayment + value
        var newPackage = await oldPackage.updateAttribute("totalPayment", newTotalPayment);
        callback(null, newPackage)
      })
    } catch (error) {
      callback(error)
    }
  };

  

};
