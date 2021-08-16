'use strict';
var firbaseJson = require('../../server/gelpFirebase.json');
var firebase = require('firebase-admin');
firebase.initializeApp({
    credential: firebase.credential.cert(firbaseJson)
});


module.exports = function(Notification) {
    let notificationMessage = {
        "NEW_FOLLOWER": {
            title: "New Follower",
            body: "Someone start follow you"
        },
        "NEW_COURSE": {
            title: "New Course",
            body: "New course was added"
        },
        "NEW_PODCAST": {
            title: "New Podcast",
            body: "New podcast was added"
        },
        "NEW_SESSION_PODCAST": {
            title: "New Session",
            body: "New session was added to podcast"
        },
        "NEW_SESSION_COURSE": {
            title: "New Session",
            body: "New session was added to course"
        },

    }
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

    Notification.createGelpNotifications = async function(arrayOfObjects, ownerId, typeId, cb) {
        let typeObject = await Notification.app.models.notificationType.findById(typeId);
        for (let index = 0; index < arrayOfObjects.length; index++) {
            const element = arrayOfObjects[index];
            arrayOfObjects[index]['typeId'] = typeId;
            if (ownerId)
                arrayOfObjects[index]['ownerId'] = ownerId
        }
        console.log(arrayOfObjects)
        let appNotificationData = await Notification.create(arrayOfObjects)
        console.log(appNotificationData)

        for (let index = 0; index < appNotificationData.length; index++) {
            const element = appNotificationData[index];
            let data = { "notificationId": element.id.toString(), type: typeObject.name };
            if (element['courseId']) {
                data['courseId'] = element['courseId'].toString()
            }
            if (element['youtuberId']) {
                data['youtuberId'] = element['youtuberId'].toString()
            }
            if (element['onlineSessionId']) {
                data['onlineSessionId'] = element['onlineSessionId'].toString()
            }
            if (element['podcastId']) {
                data['podcastId'] = element['podcastId'].toString()
            }

            let youtuberToken = await Notification.app.models.fcmToken.find({ "where": { "youtuberId": element.ownerId } })
            let arrayYoutuberToken = []
            for (let index = 0; index < youtuberToken.length; index++) {
                const elementToken = youtuberToken[index];
                arrayYoutuberToken.push(elementToken.token)
            }
            var messageObject = {
                "click_action": "FLUTTER_NOTIFICATION_CLICK",
                notification: notificationMessage[typeObject.name]

            };
            messageObject['data'] = data;
            console.log(messageObject)
            console.log(arrayYoutuberToken)
            firebase.messaging().sendToDevice(arrayYoutuberToken, messageObject)
                .then(function(response) {
                    console.log("Successfully sent message:", response.results[0]);
                })
                .catch(function(error) {
                    console.log("Error sending message:", error);
                });
        }
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