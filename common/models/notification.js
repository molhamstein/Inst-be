'use strict';

module.exports = function(Notification) {
    Notification.createNotifications = function(arrayOfObjects, key, typeUSer, typeId, keyRelation, objectId, cb) {
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

    Notification.createGelpNotifications = function(arrayOfObjects, ownerId, typeId, cb) {
        var notificationData = []
        for (let index = 0; index < arrayOfObjects.length; index++) {
            const element = arrayOfObjects[index];
            arrayOfObjects[index]['typeId'] = typeId;
            if (ownerId)
                arrayOfObjects[index]['ownerId'] = ownerId
        }
        Notification.create(arrayOfObjects)
    }

    Notification.readNotification = async function(id, context, callback) {
        try {
            var userId = context.req.accessToken.userId;

            let not = await Notification.findOne({ "where": { "id": id, "ownerId": userId } })
            if (not == null) {
                throw Notification.app.err.global.authorization()
            }

            await not.updateAttribute("isRead", true)
            callback(null, {})
        } catch (error) {
            callback(error)
        }
    }

};