'use strict';
const path = require('path');
const configPath = process.env.NODE_ENV === undefined ?
    '../../server/config.json' :
    `../../server/config.${process.env.NODE_ENV}.json`;
const config = require(configPath);

var ffmpegStatic = require('ffmpeg-static');
var ffprobeStatic = require('ffprobe-static');

var ffmpeg = require('fluent-ffmpeg');
const { getVideoDurationInSeconds } = require('get-video-duration');
const {
    getAudioDurationInSeconds
} = require('get-audio-duration')

module.exports = function(Uploadfile) {


    Uploadfile.afterRemote('upload', function(context, result, next) {
        // console.log(context.req.accessToken)
        let userId
        if (context.req.accessToken)
            userId = context.req.accessToken.userId
        let files = [];
        var folderName = context.req.params.container;
        let src = path.join(__dirname, '../../../MGMTImage/uploadFiles/');
        var urlFileRoot = config.domain + config.restApiRoot + Uploadfile.http.path;
        var urlFileRootSave = urlFileRoot + '/' + folderName + '/download/'
        var urlThumbRootSave = urlFileRoot + '/' + "thumbnail" + '/download/'
        var urlWebThumbRootSave = urlFileRoot + '/' + "web-thumbnail" + '/download/'

        // if (process.env.NODE_ENV != undefined) {
        //     ffmpeg.setFfmpegPath(path.join(config.thumbUrl + config.programFFmpegName[0]));
        //     ffmpeg.setFfprobePath(path.join(config.thumbUrl + config.programFFmpegName[1]));
        // } 

        ffmpeg.setFfmpegPath(ffmpegStatic.path);
        ffmpeg.setFfprobePath(ffprobeStatic.path);



        let arrayFiles = result.result.files.file;
        for (let index = 0; index < arrayFiles.length; index++) {
            const file = arrayFiles[index];
            if (folderName == "video") {

                getVideoDurationInSeconds(src + "/video/" + file.name).then((duration) => {
                    var newWidth = 0
                    var newHeight = 0
                    var oldWidth = 0;
                    var oldHeight = 0;
                    var rotation;
                    var size
                    ffmpeg.ffprobe(src + "/" + folderName + "/" + file.name, function(err, metadata) {
                        //     // ffmpeg.ffprobe("P:/vibo/VobbleApi/uploadFiles/videos/5efa41f0-db2a-11ea-b3fb-b7d2915714b61597078561678.mp4", function (err, metadata) {
                        if (err) {
                            console.log(err);
                            console.log("err")
                        } else {
                            console.log(metadata);
                            metadata['streams'].forEach(function(element) {
                                if (element.width) {
                                    oldWidth = element.width;
                                    oldHeight = element.height;
                                    rotation = element.rotation
                                }
                            }, this);
                            if (oldWidth != 0)
                                var res = oldWidth / oldHeight;
                            else
                                var res = 2
                                    //console.log("res");
                                    //console.log(res);
                            if (rotation == -90 || rotation == 90) {
                                newHeight = 400
                                newWidth = newHeight * res
                                size = newHeight + 'x' + parseInt(newWidth)
                            } else {
                                newWidth = 400
                                newHeight = newWidth / res
                                size = newWidth + 'x' + parseInt(newHeight)
                            }
                            console.log(src + "/" + folderName + "/" + file.name)
                            console.log(src + 'thumbnail')
                            console.log(file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb.PNG")
                            console.log(size);

                            // ffmpeg('C:/Users/HP/Desktop/sample-mp4-file.mp4')
                            //     .screenshots({
                            //         count: 1,
                            //         // timestamps: [30.5, '50%', '00:10.123'],
                            //         filename: 'thumbnail-a-seconds.png',
                            //         folder: 'C:/Users/HP/Desktop/',
                            //         size: '320x240'
                            //     });

                            files.push({
                                'url': urlFileRootSave + file.name,
                                'duration': duration,
                                'type': folderName,
                                "userId": userId,
                                'thumb': urlThumbRootSave + file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb." + "png", //extension,
                                'webThumbUrl': "" //urlWebThumbRootSave + file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb." + extension
                            });
                            if (arrayFiles.length == index + 1) {
                                Uploadfile.app.models.media.create(files, function(err, data) {
                                    if (err)
                                        return next(err)
                                    context.res.json(data);
                                })
                            }
                        }
                    })
                })
            } else if (folderName == "audio") {
                getAudioDurationInSeconds(src + "/audio/" + file.name).then((duration) => {
                    console.log(duration)
                    files.push({
                        'url': urlFileRootSave + file.name,
                        'duration': duration,
                        'type': folderName,
                        "userId": userId,
                        'thumb': "", //urlThumbRootSave + file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb." + extension,
                        'webThumbUrl': "" //urlWebThumbRootSave + file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb." + extension
                    });
                    if (arrayFiles.length == index + 1) {
                        Uploadfile.app.models.media.create(files, function(err, data) {
                            if (err)
                                return next(err)
                            context.res.json(data);
                        })
                    }
                })
            } else {
                files.push({
                    'url': urlFileRootSave + file.name,
                    'type': folderName,
                    "userId": userId,
                    'thumb': "", //urlThumbRootSave + file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb." + extension,
                    'webThumbUrl': "" //urlWebThumbRootSave + file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb." + extension
                });
                if (arrayFiles.length == index + 1) {
                    Uploadfile.app.models.media.create(files, function(err, data) {
                        if (err)
                            return next(err)
                        context.res.json(data);
                    })
                }
            }
        }



        console.log(files)

    })
};