'use strict';
var g = require('strong-globalize')();
var debug = require('debug')('loopback:user');
var loopback = require('loopback');
var versions = require("../../server/boot/version.json");

const configPath = process.env.NODE_ENV === undefined ?
    '../../server/config.json' :
    `../../server/config.${process.env.NODE_ENV}.json`;
const config = require(configPath);

module.exports = function(Youtuber) {

    Youtuber.validatesInclusionOf('status', { in: ['active', 'pending', 'deactivate']
    });

    Youtuber.signUp = async function(email, password, name, callback) {
        try {
            // await Student.app.models.user.checkRoleBranchAdmin(instituteId, branchId, req)
            await Youtuber.app.dataSources.mainDB.transaction(async models => {
                const {
                    user
                } = models;
                const {
                    youtuber
                } = models
                const {
                    RoleMapping
                } = models
                const {
                    verificationCode
                } = models
                var userObj = await user.findOne({
                    "where": {
                        "email": email
                    }
                })
                if (userObj == null) {
                    userObj = await user.create({
                        "name": name,
                        "email": email
                    })
                } else {
                    throw Youtuber.app.err.user.emailAlreadyExists()
                }
                var newYoutuber = await youtuber.create({
                    "userId": userObj.id,
                    "password": password,
                    "email": email
                });

                var newRoleMapping = await RoleMapping.create({
                    "principalType": "youtuber",
                    "principalId": newYoutuber.id,
                    "roleId": 5
                })
                var youtuberId = newYoutuber.id;
                newYoutuber = await youtuber.findById(youtuberId);
                let newToken = await Youtuber.app.models.MultiAccessToken.create({
                    "userId": youtuber.id,
                    "principalType": "youtuber",
                    "ttl": 31536000000
                })

                var renderer = loopback.template('./server/template/active-user.ejs');
                let url = config.domain + config.restApiRoot + "/youtuber/activate?access_token" + newToken.id
                var html_body = renderer({ "url": url, "name": name });
                console.log(html_body)
                    // await Users.app.models.Email.send({
                    //   to: email, //"besmayahcity@gmail.com", //superAdminUser ? superAdminUser.email : "gelpcourse@gmail.com",
                    //   from: "anas@s.com",
                    //   subject: 'activate account',
                    //   html: html_body
                    // })

                callback(null, newYoutuber)
            })
        } catch (error) {
            callback(error)
        }
    };

    Youtuber.addYoutuber = async function(email, password, name, callback) {
        try {
            await Youtuber.app.dataSources.mainDB.transaction(async models => {
                const {
                    user
                } = models;
                const {
                    youtuber
                } = models
                const {
                    RoleMapping
                } = models
                const {
                    verificationCode
                } = models
                var userObj = await user.findOne({
                    "where": {
                        "email": email
                    }
                })
                if (userObj == null) {
                    userObj = await user.create({
                        "name": name,
                        "email": email
                    })
                } else {
                    throw Youtuber.app.err.user.emailAlreadyExists()
                }
                var newYoutuber = await youtuber.create({
                    "userId": userObj.id,
                    "password": password,
                    "email": email,
                    "status": "active"
                });

                var newRoleMapping = await RoleMapping.create({
                    "principalType": "youtuber",
                    "principalId": newYoutuber.id,
                    "roleId": 5
                })
                var youtuberId = newYoutuber.id;
                newYoutuber = await youtuber.findById(youtuberId);
                callback(null, newYoutuber)
            })
        } catch (error) {
            callback(error)
        }
    };



    Youtuber.socialLogin = async function(data, type, callback) {
        try {
            var socialId = data.socialId;
            var image = data.image;
            var phonenumber = data.phonenumber;
            var email = data.email;
            var name = data.name;
            var gender = data.gender;
            var birthdate = data.birthdate;

            let youtuber = await Youtuber.findOne({ "where": { "socialId": socialId, "typeLogIn": type } })
            if (youtuber == null) {
                // var pattern = new RegExp('.*' + username + '.*', "i");
                // let usernameCount = await Users.count({ "username": { regexp: pattern.toString() } })
                // if (usernameCount != 0) {
                //     username += "_" + usernameCount
                // }
                let media;
                if (image) {
                    image = await Youtuber.app.service.downloadImage(image, "profile");

                    media = await Youtuber.app.models.media.create({
                        'url': image,
                        'type': "profile"
                    })
                }
                let mainUser = await Youtuber.app.models.user.create({ "imageId": media ? media.id : null, "email": email, "name": name, gender, birthdate })
                youtuber = await Youtuber.create({ "socialId": socialId, "email": email, "typeLogIn": type, "userId": mainUser.id, "password": "000000" })
                var newRoleMapping = await Youtuber.app.models.RoleMapping.create({
                    "principalType": "youtuber",
                    "principalId": youtuber.id,
                    "roleId": 5
                })
            }
            let newToken = await Youtuber.app.models.MultiAccessToken.create({
                "userId": youtuber.id,
                "principalType": "youtuber",
                "ttl": 31536000000
            })
            let loginData = await Youtuber.app.models.MultiAccessToken.findOne({
                include: {
                    relation: 'user'
                },
                where: {
                    userId: youtuber.id,
                    id: newToken.id
                }
            })
            callback(null, loginData)
        } catch (error) {
            callback(error)
        }
    }


    Youtuber.login = function(credentials, include, fn) {
        var self = this;
        if (typeof include === 'function') {
            fn = include;
            include = undefined;
        }

        fn = fn || utils.createPromiseCallback();

        include = (include || '');
        if (Array.isArray(include)) {
            include = include.map(function(val) {
                return val.toLowerCase();
            });
        } else {
            include = include.toLowerCase();
        }


        var query = {
            email: credentials.email
        }

        if (!query.email) {
            var err2 = new Error(g.f('{{email}} is required'));
            err2.statusCode = 400;
            err2.code = 'EMAIL_REQUIRED';
            fn(err2);
            return fn.promise;
        }

        // if (!credentials.instituteId) {
        //   var err2 = new Error(g.f('{{instituteId}} is required'));
        //   err2.statusCode = 400;
        //   err2.code = 'INSTITEID_ID_REQUIRED';
        //   fn(err2);
        //   return fn.promise;
        // }

        self.app.models.User.findOne({
            where: query
        }, function(err, user) {
            console.log(query, err, user);
            var defaultError = new Error(g.f('login failed'));
            defaultError.statusCode = 401;
            defaultError.code = 'LOGIN_FAILED';

            function tokenHandler(err, token) {
                if (err) return fn(err);
                if (Array.isArray(include) ? include.indexOf('user') !== -1 : include === 'user') {
                    // NOTE(bajtos) We can't set token.user here:
                    //  1. token.user already exists, it's a function injected by
                    //     "AccessToken belongsTo User" relation
                    //  2. ModelBaseClass.toJSON() ignores own properties, thus
                    //     the value won't be included in the HTTP response
                    // See also loopback#161 and loopback#162
                    token.__data.user = user;
                }
                fn(err, token);
            }


            if (err) {
                debug('An error is reported from User.findOne: %j', err);
                fn(defaultError);
            } else if (user) {
                self.findOne({
                    where: {
                        userId: user.id,
                        // instituteId: credentials.instituteId
                    }
                }, function(err, student) {
                    console.log("student//////////")
                    console.log(student)
                    student.hasPassword(credentials.password, function(err, isMatch) {
                        if (err) {
                            debug('An error is reported from User.hasPassword: %j', err);
                            fn(defaultError);
                        } else if (isMatch) {

                            if (student.createAccessToken.length === 2) {
                                student.createAccessToken(credentials.ttl, tokenHandler);
                            } else {
                                student.createAccessToken(credentials.ttl, credentials, tokenHandler);
                            }

                        } else {
                            debug('The password is invalid for user %s', query.email || query.username);
                            fn(defaultError);
                        }
                    });
                })

            } else {
                debug('No matching record is found for user %s', query.email || query.username);
                fn(defaultError);
            }
        });
        return fn.promise;
    }


    Youtuber.me = async function(context, callback) {
        try {
            let userVersion = context.req.headers['version']
            let platformUser = context.req.headers['platform']
            var userId = context.req.accessToken.userId;
            let user = await Youtuber.findById(userId)
            if (user.status != 'active')
                throw Youtuber.app.err.user.userIsNotActive()
                    // await user.updateAttribute("lastLogin", new Date())
            if (userVersion == null)
                callback(null, user);
            else {
                var versionObject = Youtuber.compirVersion(userVersion, platformUser)
                user['version'] = versionObject
                callback(null, user);
            }
        } catch (error) {
            callback(error)
        }
    }


    Youtuber.myPurchasedCourse = async function(context, callback) {
        try {
            var userId = context.req.accessToken.userId;
            var userCourses = await Youtuber.app.models.youtuberCourse.find({ "where": { "youtuberId": userId } });
            let coursesId = [];
            for (let index = 0; index < userCourses.length; index++) {
                const element = userCourses[index];
                coursesId.push(element.courseId)
            }

            let courses = await Youtuber.app.models.Course.find({ "where": { "id": { inq: coursesId } } })
            courses = await Youtuber.app.models.Course.checkIsInCourse(courses, userId)
            callback(null, courses)
        } catch (error) {
            callback(error)
        }
    }


    Youtuber.userCourse = async function(id, context, callback) {
        try {
            var userId;
            if (context.req.accessToken)
                userId = context.req.accessToken.userId;
            let filter = { "where": { "and": [{ "youtuberId": id }] } }
            if (userId != id)
                filter['where']['and'].push({ "status": "active" })
            let courses = await Youtuber.app.models.Course.find(filter)
            callback(null, courses)
        } catch (error) {
            callback(error)
        }
    }

    Youtuber.userPodcast = async function(id, context, callback) {
        try {
            var userId;
            if (context.req.accessToken)
                userId = context.req.accessToken.userId;
            let filter = { "where": { "and": [{ "youtuberId": id }] } }
            if (userId != id)
                filter['where']['and'].push({ "status": "active" })

            let Podcasts = await Youtuber.app.models.podcast.find(filter)
            callback(null, Podcasts)
        } catch (error) {
            callback(error)
        }
    }


    Youtuber.compirVersion = function(userVersion, platformUser) {
        let version = versions[platformUser]
        var isAfterLoadVersion = false
        var isBeforLastVersion = false
        var arrayUserVersion = userVersion.toString().split('.');
        var arrayLastVersion = version.lastVersion.toString().split('.');
        var arrayLoadVersion = version.loadVersion.toString().split('.');
        for (let index = 0; index < arrayUserVersion.length; index++) {
            const element = parseInt(arrayUserVersion[index]);
            const elementLoadVersion = parseInt(arrayLoadVersion[index]);
            if (element > elementLoadVersion) {
                isAfterLoadVersion = true
                break;
            }
            if (element < elementLoadVersion) {
                isAfterLoadVersion = false
                break;
            }
        }
        if (isAfterLoadVersion == false) {
            return { "status": "obsolete", "link": version.link }
        }

        for (let index = 0; index < arrayUserVersion.length; index++) {
            const element = parseInt(arrayUserVersion[index]);
            const elementLastVersion = parseInt(arrayLastVersion[index]);
            if (element < elementLastVersion) {
                isBeforLastVersion = true
                break;
            }
            if (element > elementLastVersion) {
                isBeforLastVersion = false
                break;
            }
        }


        if (isBeforLastVersion == true) {
            return { "status": "updateAvailable", "link": version.link }
        } else {
            if (userVersion == version.reviewVersion)
                return { "status": "inreview" }
            else
                return { "status": "uptodate" }
        }
    }

    Youtuber.activeYoutuber = async function(context, callback) {
        try {
            var userId = context.req.accessToken.user;
            let user = await Youtuber.findById(userId)
            if (user.status == 'active') {
                callback(null, null)
            }
            await user.updateAttribute("status", 'active')
            callback(null, null);
        } catch (error) {
            callback(error)
        }
    }


    Youtuber.resetPasswordYoutuber = async function(password, context, callback) {
        try {
            var userId = context.req.accessToken.userId;
            let user = await Youtuber.findById(userId)

            await user.updateAttribute("password", Youtuber.hashPassword(password))
            callback(null, user);
        } catch (error) {
            callback(error)
        }
    }

    Youtuber.requestResetPasswordYoutuber = async function(email, callback) {
        try {
            let user = await Youtuber.findOne({ "where": { email: email } })
            let token = await Youtuber.app.models.MultiAccessToken.create({
                "userId": user.id,
                "principalType": "youtuber",
                "ttl": 31536000000
            })
            var renderer = loopback.template('./server/template/reset-password.ejs');
            let url = config.siteDomain + "resetPassword?access_token" + newToken.id
            var html_body = renderer({ "url": url });
            console.log(html_body)

            await Youtuber.app.models.Email.send({
                to: email, //"besmayahcity@gmail.com", //superAdminUser ? superAdminUser.email : "gelpcourse@gmail.com",
                from: "gelpcourse@gmail.com",
                subject: 'activate account',
                html: html_body
            })
            callback(null, user);
        } catch (error) {
            callback(error)
        }
    }



    Youtuber.enterSystem = async function(context, callback) {
        try {
            var userId = context.req.accessToken.userId;
            let user = await Youtuber.findById(userId)
            let tempEnterSystemCount = user.enterSystemCount + 1;
            let tempTotalPoint = user.totalPoint + 1;
            let levelId = await Youtuber.app.service.getLevelId(Youtuber.app, user, { "totalPoint": tempTotalPoint, "enterSystemCount": tempEnterSystemCount });
            await user.updateAttributes({ "levelId": levelId, "totalPoint": tempTotalPoint, "enterSystemCount": tempEnterSystemCount });
            callback(null, "ok")
        } catch (error) {
            callback(error)
        }
    }

    Youtuber.generateInvitationCode = async function(context, callback) {
        try {
            var userId = context.req.accessToken.userId;
            var code = Youtuber.app.service.makeCode(8);
            var invitationCode = await Youtuber.app.models.invitationCode.create({ "code": code, "youtuberId": userId });
            callback(null, invitationCode)
        } catch (error) {
            callback(error)
        }
    }


    Youtuber.changePasswordYoutuber = async function(oldPassword, newPassword, context, callback) {
        try {
            var userId = context.req.accessToken.userId;
            let user = await Youtuber.findById(userId)
            let isRightPassword = await user.hasPassword(oldPassword);
            if (!isRightPassword) {

            } else {
                await user.updateAttribute("password", Youtuber.hashPassword(newPassword))
                let newToken = await Youtuber.app.models.MultiAccessToken.create({
                    "userId": userId,
                    "principalType": "youtuber",
                    "ttl": 31536000000
                })
                let loginData = await Youtuber.app.models.MultiAccessToken.findOne({
                    include: {
                        relation: 'user'
                    },
                    where: {
                        userId: userId,
                        id: newToken.id
                    }
                })
                callback(null, loginData)
            }
        } catch (error) {
            callback(error)
        }
    }


    Youtuber.updateProfile = async function(data, context, callback) {
        try {
            var userId = context.req.accessToken.userId;
            let mainYoutuber = await Youtuber.findById(userId);
            let mainUser = await Youtuber.app.models.User.findById(mainYoutuber.userId);
            await mainUser.updateAttributes({ "phonenumber": data.phonenumber, "imageId": data.imageId, "ISOCode": data.ISOCode, "name": data.name })
            await mainYoutuber.updateAttributes({ "about": data.about, "primaryIdentifier": data.primaryIdentifier })
            callback(null, {})
        } catch (error) {
            callback(error)
        }
    }




};