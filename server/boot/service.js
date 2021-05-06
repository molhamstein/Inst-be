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
    getLevelId: function(app, point) {
        return new Promise(function(resolve, reject) {
            app.models.levels.findOne({
                    "where": { "min": { "lte": point }, "max": { "gte": point } }
                },
                function(err, level) {
                    if (err) reject(err)
                    console.log("level")
                    console.log(level)
                    console.log(point)
                    resolve(level ? level.id : null)
                })
        })
    }
}