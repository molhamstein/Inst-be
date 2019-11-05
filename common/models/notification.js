'use strict';

module.exports = function (Notification) {
  Notification.createNotifications = function (arrayOfObjects, key, typeUSer, typeId, keyRelation, objectId, cb) {
    var notificationData = []
    arrayOfObjects.forEach(element => {
      var object = {
        "typeId": typeId
      }
      object[keyRelation] = objectId
      if (typeUSer == 'student') {
        object['studentId'] = element[key]
      }
      if (typeUSer == 'teacher') {
        object['teacherId'] = element[key]
      }
      notificationData.push(object)
    });
    Notification.create(notificationData)
  }
};
