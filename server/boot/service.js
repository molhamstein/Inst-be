'use strict';
const configPath = process.env.NODE_ENV === undefined ?
    '../../server/config.json' :
    `../../server/config.${process.env.NODE_ENV}.json`;
const config = require(configPath);
const urlFileRoot = config.domain + config.restApiRoot + "/files";
const urlFileRootSave = urlFileRoot + '/profile/download/';
const path = require('path');
const ejs = require('ejs');
module.exports = {
    downloadImage: function(image, foldrName) {
        return new Promise(function(resolve, reject) {
            const download = require('image-downloader')
            const parts = image.split('.');
            var extension = "jpg"
            var newFilename = (new Date()).getTime() + '.' + extension;

            const options = {
                url: image,
                dest: '../MGMTImage/uploadFiles/' + foldrName + '/' + newFilename
            }
            download.image(options)
                .then(({ filename, image }) => {
                    let imageUrl = urlFileRootSave + newFilename;
                    resolve(imageUrl)
                })
                .catch((err) => reject(err))
        })
    },
    addHourse: function(hourse, date) {
        let newDate = new Date();
        if (date != null) {
            newDate = new Date(date)
        }
        newDate.setTime(newDate.getTime() + (hourse * 60 * 60 * 1000));
        return newDate;
    },
    addMounth: function(mounth, date) {
        let newDate = new Date();
        if (date != null) {
            newDate = new Date(date)
        }
        newDate.setMonth(newDate.getMonth() + mounth);
        return newDate;
    },
    makeCode: function(length, isJustNumber = false) {
        var result = '';
        var characters = isJustNumber ? "123456789" : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    getLevelId: function(app, mainUser, data) {
        return new Promise(function(resolve, reject) {
            let filterDate = { "minTotalPoint": { "lte": data.totalPoint ? data.totalPoint : mainUser.totalPoint }, "maxTotalPoint": { "gte": data.totalPoint ? data.totalPoint : mainUser.totalPoint } }

            filterDate['minEnterSystemCount'] = { "lte": data.enterSystemCount ? data.enterSystemCount : mainUser.enterSystemCount }
            filterDate['maxEnterSystemCount'] = { "gte": data.enterSystemCount ? data.enterSystemCount : mainUser.enterSystemCount }


            filterDate['minTotalSessionTime'] = { "lte": data.totalSessionTime ? data.totalSessionTime : mainUser.totalSessionTime }
            filterDate['maxTotalSessionTime'] = { "gte": data.totalSessionTime ? data.totalSessionTime : mainUser.totalSessionTime }


            filterDate['minCompletedCourses'] = { "lte": data.completedCourses ? data.completedCourses : mainUser.completedCourses }
            filterDate['maxCompletedCourses'] = { "gte": data.completedCourses ? data.completedCourses : mainUser.completedCourses }

            filterDate['minTotalSessionCreaterTime'] = { "lte": data.totalSessionCreaterTime ? data.totalSessionCreaterTime : mainUser.totalSessionCreaterTime }
            filterDate['maxTotalSessionCreaterTime'] = { "gte": data.totalSessionCreaterTime ? data.totalSessionCreaterTime : mainUser.totalSessionCreaterTime }

            filterDate['minFollower'] = { "lte": data.follower ? data.follower : mainUser.follower }
            filterDate['maxFollower'] = { "gte": data.follower ? data.follower : mainUser.follower }


            app.models.levels.findOne({
                    "where": filterDate
                },
                function(err, level) {
                    if (err) reject(err)
                    console.log("level")
                    console.log(level)

                    console.log(data)
                    console.log(filterDate)
                    resolve(level ? level.id : null)
                })
        })
    }
}