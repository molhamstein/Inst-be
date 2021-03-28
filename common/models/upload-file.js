'use strict';
const path = require('path');
const configPath = process.env.NODE_ENV === undefined ?
  '../../server/config.json' :
  `../../server/config.${process.env.NODE_ENV}.json`;
const config = require(configPath);
var ffmpeg = require('fluent-ffmpeg');
const { getVideoDurationInSeconds } = require('get-video-duration');
const {
  getAudioDurationInSeconds
} = require('get-audio-duration')

module.exports = function (Uploadfile) {


  Uploadfile.afterRemote('upload', function (context, result, next) {
    // console.log(context.req.accessToken)
    let userId = context.req.accessToken.userId
    let files = [];
    var folderName = context.req.params.container;
    let src = path.join(__dirname, '../../../MGMTImage/uploadFiles/');
    var urlFileRoot = config.domain + config.restApiRoot + Uploadfile.http.path;
    var urlFileRootSave = urlFileRoot + '/' + folderName + '/download/'
    var urlThumbRootSave = urlFileRoot + '/' + "thumbnail" + '/download/'
    var urlWebThumbRootSave = urlFileRoot + '/' + "web-thumbnail" + '/download/'

    if (process.env.NODE_ENV != undefined) {
      ffmpeg.setFfmpegPath(path.join(config.thumbUrl + config.programFFmpegName[0]));
      ffmpeg.setFfprobePath(path.join(config.thumbUrl + config.programFFmpegName[1]));
    }



    let arrayFiles = result.result.files.file;
    for (let index = 0; index < arrayFiles.length; index++) {
      const file = arrayFiles[index];
      if (folderName == "video") {

        getVideoDurationInSeconds(src + "/video/" + file.name).then((duration) => {
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
            Uploadfile.app.models.media.create(files, function (err, data) {
              if (err)
                return next(err)
              context.res.json(data);
            })
          }
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
            Uploadfile.app.models.media.create(files, function (err, data) {
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
          Uploadfile.app.models.media.create(files, function (err, data) {
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
