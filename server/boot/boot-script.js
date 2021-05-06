'use strict';

module.exports = function(app) {
    var Category = app.models.Category;
    var Subject = app.models.Subject;
    var Admin = app.models.Admin;
    var Role = app.models.Role
    var RoleMapping = app.models.RoleMapping;
    var AccessToken = app.models.AccessToken;
    var MultiAccessToken = app.models.MultiAccessToken;
    var ACL = app.models.ACL;
    var SubCategory = app.models.subCategory;
    var country = app.models.country;
    var Property = app.models.Property;
    var User = app.models.User;
    var userInstitute = app.models.userInstitute;
    var Media = app.models.Media;
    var Institute = app.models.Institute;
    var restriction = app.models.restriction;

    var InstitutesImages = app.models.InstitutesImages;
    var instituteAdmin = app.models.instituteAdmin;
    var Branch = app.models.Branch;
    var branchImages = app.models.branchImages;
    var branchAdmin = app.models.branchAdmin;

    var venue = app.models.venue;
    var venueProperties = app.models.venueProperties;
    var venueImages = app.models.venueImages;
    var student = app.models.student;
    var verificationCode = app.models.verificationCode;
    var studentPayment = app.models.studentPayment;
    var studentNote = app.models.studentNote;

    var teacher = app.models.teacher;
    var teacherNote = app.models.teacherNote;
    var teacherSubcategory = app.models.teacherSubcategory;
    var waitingList = app.models.waitingList;
    var waitingListStudent = app.models.waitingListStudent;
    var course = app.models.course;
    var supply = app.models.supply;

    var courseImages = app.models.courseImages;
    var session = app.models.session;
    var teacherCourse = app.models.teacherCourse;
    var teacherCoursePayment = app.models.teacherCoursePayment;
    var teacherPayment = app.models.teacherPayment;

    var studentCourse = app.models.studentCourse;
    // var packageStudent = app.models.packageStudent;
    // var packageCourse = app.models.packageCourse;
    var studentSession = app.models.studentSession;
    // var packageStudentPayment = app.models.packageStudentPayment;
    var notification = app.models.notification;
    var notificationType = app.models.notificationType;

    var transaction = app.models.transaction
    var messageLog = app.models.messageLog
    var institutePayment = app.models.institutePayment
    var tag = app.models.tag
    var studentTag = app.models.studentTag


    var youtuber = app.models.youtuber
    var unit = app.models.unit
    var onlineSession = app.models.onlineSession
    var youtuberCourse = app.models.youtuberCourse
    var onlineSessionWatch = app.models.onlineSessionWatch
    var podcast = app.models.podcast
    var podcastSubscribe = app.models.podcastSubscribe
    var rate = app.models.rate
    var follower = app.models.follower
    var invitationCode = app.models.invitationCode
    var levels = app.models.levels





    var countryData = [
        { "name": "Afghanistan", "code": "AF" },
        { "name": "land Islands", "code": "AX" },
        { "name": "Albania", "code": "AL" },
        { "name": "Algeria", "code": "DZ" },
        { "name": "American Samoa", "code": "AS" },
        { "name": "AndorrA", "code": "AD" },
        { "name": "Angola", "code": "AO" },
        { "name": "Anguilla", "code": "AI" },
        { "name": "Antarctica", "code": "AQ" },
        { "name": "Antigua and Barbuda", "code": "AG" },
        { "name": "Argentina", "code": "AR" },
        { "name": "Armenia", "code": "AM" },
        { "name": "Aruba", "code": "AW" },
        { "name": "Australia", "code": "AU" },
        { "name": "Austria", "code": "AT" },
        { "name": "Azerbaijan", "code": "AZ" },
        { "name": "Bahamas", "code": "BS" },
        { "name": "Bahrain", "code": "BH" },
        { "name": "Bangladesh", "code": "BD" },
        { "name": "Barbados", "code": "BB" },
        { "name": "Belarus", "code": "BY" },
        { "name": "Belgium", "code": "BE" },
        { "name": "Belize", "code": "BZ" },
        { "name": "Benin", "code": "BJ" },
        { "name": "Bermuda", "code": "BM" },
        { "name": "Bhutan", "code": "BT" },
        { "name": "Bolivia", "code": "BO" },
        { "name": "Bosnia and Herzegovina", "code": "BA" },
        { "name": "Botswana", "code": "BW" },
        { "name": "Bouvet Island", "code": "BV" },
        { "name": "Brazil", "code": "BR" },
        { "name": "British Indian Ocean Territory", "code": "IO" },
        { "name": "Brunei Darussalam", "code": "BN" },
        { "name": "Bulgaria", "code": "BG" },
        { "name": "Burkina Faso", "code": "BF" },
        { "name": "Burundi", "code": "BI" },
        { "name": "Cambodia", "code": "KH" },
        { "name": "Cameroon", "code": "CM" },
        { "name": "Canada", "code": "CA" },
        { "name": "Cape Verde", "code": "CV" },
        { "name": "Cayman Islands", "code": "KY" },
        { "name": "Central African Republic", "code": "CF" },
        { "name": "Chad", "code": "TD" },
        { "name": "Chile", "code": "CL" },
        { "name": "China", "code": "CN" },
        { "name": "Christmas Island", "code": "CX" },
        { "name": "Cocos (Keeling) Islands", "code": "CC" },
        { "name": "Colombia", "code": "CO" },
        { "name": "Comoros", "code": "KM" },
        { "name": "Congo", "code": "CG" },
        { "name": "Congo, The Democratic Republic of the", "code": "CD" },
        { "name": "Cook Islands", "code": "CK" },
        { "name": "Costa Rica", "code": "CR" },
        { "name": "Cote D'Ivoire", "code": "CI" },
        { "name": "Croatia", "code": "HR" },
        { "name": "Cuba", "code": "CU" },
        { "name": "Cyprus", "code": "CY" },
        { "name": "Czech Republic", "code": "CZ" },
        { "name": "Denmark", "code": "DK" },
        { "name": "Djibouti", "code": "DJ" },
        { "name": "Dominica", "code": "DM" },
        { "name": "Dominican Republic", "code": "DO" },
        { "name": "Ecuador", "code": "EC" },
        { "name": "Egypt", "code": "EG" },
        { "name": "El Salvador", "code": "SV" },
        { "name": "Equatorial Guinea", "code": "GQ" },
        { "name": "Eritrea", "code": "ER" },
        { "name": "Estonia", "code": "EE" },
        { "name": "Ethiopia", "code": "ET" },
        { "name": "Falkland Islands (Malvinas)", "code": "FK" },
        { "name": "Faroe Islands", "code": "FO" },
        { "name": "Fiji", "code": "FJ" },
        { "name": "Finland", "code": "FI" },
        { "name": "France", "code": "FR" },
        { "name": "French Guiana", "code": "GF" },
        { "name": "French Polynesia", "code": "PF" },
        { "name": "French Southern Territories", "code": "TF" },
        { "name": "Gabon", "code": "GA" },
        { "name": "Gambia", "code": "GM" },
        { "name": "Georgia", "code": "GE" },
        { "name": "Germany", "code": "DE" },
        { "name": "Ghana", "code": "GH" },
        { "name": "Gibraltar", "code": "GI" },
        { "name": "Greece", "code": "GR" },
        { "name": "Greenland", "code": "GL" },
        { "name": "Grenada", "code": "GD" },
        { "name": "Guadeloupe", "code": "GP" },
        { "name": "Guam", "code": "GU" },
        { "name": "Guatemala", "code": "GT" },
        { "name": "Guernsey", "code": "GG" },
        { "name": "Guinea", "code": "GN" },
        { "name": "Guinea-Bissau", "code": "GW" },
        { "name": "Guyana", "code": "GY" },
        { "name": "Haiti", "code": "HT" },
        { "name": "Heard Island and Mcdonald Islands", "code": "HM" },
        { "name": "Holy See (Vatican City State)", "code": "VA" },
        { "name": "Honduras", "code": "HN" },
        { "name": "Hong Kong", "code": "HK" },
        { "name": "Hungary", "code": "HU" },
        { "name": "Iceland", "code": "IS" },
        { "name": "India", "code": "IN" },
        { "name": "Indonesia", "code": "ID" },
        { "name": "Iran, Islamic Republic Of", "code": "IR" },
        { "name": "Iraq", "code": "IQ" },
        { "name": "Ireland", "code": "IE" },
        { "name": "Isle of Man", "code": "IM" },
        { "name": "Israel", "code": "IL" },
        { "name": "Italy", "code": "IT" },
        { "name": "Jamaica", "code": "JM" },
        { "name": "Japan", "code": "JP" },
        { "name": "Jersey", "code": "JE" },
        { "name": "Jordan", "code": "JO" },
        { "name": "Kazakhstan", "code": "KZ" },
        { "name": "Kenya", "code": "KE" },
        { "name": "Kiribati", "code": "KI" },
        { "name": "Korea, Democratic People'S Republic of", "code": "KP" },
        { "name": "Korea, Republic of", "code": "KR" },
        { "name": "Kuwait", "code": "KW" },
        { "name": "Kyrgyzstan", "code": "KG" },
        { "name": "Lao People'S Democratic Republic", "code": "LA" },
        { "name": "Latvia", "code": "LV" },
        { "name": "Lebanon", "code": "LB" },
        { "name": "Lesotho", "code": "LS" },
        { "name": "Liberia", "code": "LR" },
        { "name": "Libyan Arab Jamahiriya", "code": "LY" },
        { "name": "Liechtenstein", "code": "LI" },
        { "name": "Lithuania", "code": "LT" },
        { "name": "Luxembourg", "code": "LU" },
        { "name": "Macao", "code": "MO" },
        { "name": "Macedonia, The Former Yugoslav Republic of", "code": "MK" },
        { "name": "Madagascar", "code": "MG" },
        { "name": "Malawi", "code": "MW" },
        { "name": "Malaysia", "code": "MY" },
        { "name": "Maldives", "code": "MV" },
        { "name": "Mali", "code": "ML" },
        { "name": "Malta", "code": "MT" },
        { "name": "Marshall Islands", "code": "MH" },
        { "name": "Martinique", "code": "MQ" },
        { "name": "Mauritania", "code": "MR" },
        { "name": "Mauritius", "code": "MU" },
        { "name": "Mayotte", "code": "YT" },
        { "name": "Mexico", "code": "MX" },
        { "name": "Micronesia, Federated States of", "code": "FM" },
        { "name": "Moldova, Republic of", "code": "MD" },
        { "name": "Monaco", "code": "MC" },
        { "name": "Mongolia", "code": "MN" },
        { "name": "Montenegro", "code": "ME" },
        { "name": "Montserrat", "code": "MS" },
        { "name": "Morocco", "code": "MA" },
        { "name": "Mozambique", "code": "MZ" },
        { "name": "Myanmar", "code": "MM" },
        { "name": "Namibia", "code": "NA" },
        { "name": "Nauru", "code": "NR" },
        { "name": "Nepal", "code": "NP" },
        { "name": "Netherlands", "code": "NL" },
        { "name": "Netherlands Antilles", "code": "AN" },
        { "name": "New Caledonia", "code": "NC" },
        { "name": "New Zealand", "code": "NZ" },
        { "name": "Nicaragua", "code": "NI" },
        { "name": "Niger", "code": "NE" },
        { "name": "Nigeria", "code": "NG" },
        { "name": "Niue", "code": "NU" },
        { "name": "Norfolk Island", "code": "NF" },
        { "name": "Northern Mariana Islands", "code": "MP" },
        { "name": "Norway", "code": "NO" },
        { "name": "Oman", "code": "OM" },
        { "name": "Pakistan", "code": "PK" },
        { "name": "Palau", "code": "PW" },
        { "name": "Palestinian Territory, Occupied", "code": "PS" },
        { "name": "Panama", "code": "PA" },
        { "name": "Papua New Guinea", "code": "PG" },
        { "name": "Paraguay", "code": "PY" },
        { "name": "Peru", "code": "PE" },
        { "name": "Philippines", "code": "PH" },
        { "name": "Pitcairn", "code": "PN" },
        { "name": "Poland", "code": "PL" },
        { "name": "Portugal", "code": "PT" },
        { "name": "Puerto Rico", "code": "PR" },
        { "name": "Qatar", "code": "QA" },
        { "name": "Reunion", "code": "RE" },
        { "name": "Romania", "code": "RO" },
        { "name": "Russian Federation", "code": "RU" },
        { "name": "RWANDA", "code": "RW" },
        { "name": "Saint Helena", "code": "SH" },
        { "name": "Saint Kitts and Nevis", "code": "KN" },
        { "name": "Saint Lucia", "code": "LC" },
        { "name": "Saint Pierre and Miquelon", "code": "PM" },
        { "name": "Saint Vincent and the Grenadines", "code": "VC" },
        { "name": "Samoa", "code": "WS" },
        { "name": "San Marino", "code": "SM" },
        { "name": "Sao Tome and Principe", "code": "ST" },
        { "name": "Saudi Arabia", "code": "SA" },
        { "name": "Senegal", "code": "SN" },
        { "name": "Serbia", "code": "RS" },
        { "name": "Seychelles", "code": "SC" },
        { "name": "Sierra Leone", "code": "SL" },
        { "name": "Singapore", "code": "SG" },
        { "name": "Slovakia", "code": "SK" },
        { "name": "Slovenia", "code": "SI" },
        { "name": "Solomon Islands", "code": "SB" },
        { "name": "Somalia", "code": "SO" },
        { "name": "South Africa", "code": "ZA" },
        { "name": "South Georgia and the South Sandwich Islands", "code": "GS" },
        { "name": "Spain", "code": "ES" },
        { "name": "Sri Lanka", "code": "LK" },
        { "name": "Sudan", "code": "SD" },
        { "name": "Suriname", "code": "SR" },
        { "name": "Svalbard and Jan Mayen", "code": "SJ" },
        { "name": "Swaziland", "code": "SZ" },
        { "name": "Sweden", "code": "SE" },
        { "name": "Switzerland", "code": "CH" },
        { "name": "Syrian Arab Republic", "code": "SY" },
        { "name": "Taiwan, Province of China", "code": "TW" },
        { "name": "Tajikistan", "code": "TJ" },
        { "name": "Tanzania, United Republic of", "code": "TZ" },
        { "name": "Thailand", "code": "TH" },
        { "name": "Timor-Leste", "code": "TL" },
        { "name": "Togo", "code": "TG" },
        { "name": "Tokelau", "code": "TK" },
        { "name": "Tonga", "code": "TO" },
        { "name": "Trinidad and Tobago", "code": "TT" },
        { "name": "Tunisia", "code": "TN" },
        { "name": "Turkey", "code": "TR" },
        { "name": "Turkmenistan", "code": "TM" },
        { "name": "Turks and Caicos Islands", "code": "TC" },
        { "name": "Tuvalu", "code": "TV" },
        { "name": "Uganda", "code": "UG" },
        { "name": "Ukraine", "code": "UA" },
        { "name": "United Arab Emirates", "code": "AE" },
        { "name": "United Kingdom", "code": "GB" },
        { "name": "United States", "code": "US" },
        { "name": "United States Minor Outlying Islands", "code": "UM" },
        { "name": "Uruguay", "code": "UY" },
        { "name": "Uzbekistan", "code": "UZ" },
        { "name": "Vanuatu", "code": "VU" },
        { "name": "Venezuela", "code": "VE" },
        { "name": "Viet Nam", "code": "VN" },
        { "name": "Virgin Islands, British", "code": "VG" },
        { "name": "Virgin Islands, U.S.", "code": "VI" },
        { "name": "Wallis and Futuna", "code": "WF" },
        { "name": "Western Sahara", "code": "EH" },
        { "name": "Yemen", "code": "YE" },
        { "name": "Zambia", "code": "ZM" },
        { "name": "Zimbabwe", "code": "ZW" }
    ]

    var categoryData = [{
        "nameEn": "scientific",
        "nameAr": "علمي"
    }, {
        "nameEn": "literary",
        "nameAr": "أدبي"
    }, {
        "nameEn": "language",
        "nameAr": "لغات"
    }]


    var subjectData = [{
        "nameEn": "math",
        "nameAr": "رياضيات",
        "categoryId": 1
    }, {
        "nameEn": "physics",
        "nameAr": "الفيزياء",
        "categoryId": 1
    }, {
        "nameEn": "history",
        "nameAr": "تاريخ",
        "categoryId": 2,
    }, {
        "nameEn": "english",
        "nameAr": "انكليزي",
        "categoryId": 3
    }, {
        "nameEn": "french",
        "nameAr": "فرنسي",
        "categoryId": 3
    }]


    var subCategoryData = [{
            "nameEn": "ninth class",
            "nameAr": "صف تاسع",
            "subjectId": 1,
            // "id":1
        },
        {
            "nameEn": "tenth class",
            "nameAr": "صف عاشر",
            "subjectId": 1,
            // "id":2
        }, {
            "nameEn": "new headway",
            "nameAr": "نيو هيد وي",
            "subjectId": 4,
            // "id":3
        },
        {
            "nameEn": "level 4",
            "nameAr": "مستوى 4",
            "subcategoryId": 3,
            // "id":4
        },
        {
            "nameEn": "B",
            "nameAr": "B",
            "subcategoryId": 4,
            // "id":5
        },
        {
            "nameEn": "fourth class",
            "nameAr": "صف رابع",
            "subjectId": 3,
            // "id":6
        },
        {
            "nameEn": "first section",
            "nameAr": "الفصل الأول",
            "subcategoryId": 6,
            // "id":7
        }
    ]

    var propertyData = [{
            "nameEn": "has board",
            "nameAr": "يوجد لوح",
            "type": "check",
        },
        {
            "nameEn": "chair count",
            "nameAr": "عدد المقاعد",
            "type": "number",
        },
        {
            "nameEn": "has projector",
            "nameAr": "يوجد بروجكتر",
            "type": "check",
        },
        {
            "nameEn": "has speaker",
            "nameAr": "يوجد مكبرات صوت",
            "type": "check",
        }
    ]
    var adminData = [{
        "email": "admin@gelp.com",
        "password": "password",
        username: "admin",
        emailVerified: true
    }]

    var roleData = [{
            name: "super-admin",
            description: "brain socket admin"
        }, {
            name: "user-institute",
            description: "user institute"
        }, {
            name: "student",
            description: "student"
        },
        {
            name: "teacher",
            description: "teacher"
        }
    ]


    var notificationTypeData = [{
        "name": "CHANGE_SESSION"
    }, {
        "name": "CANCEL_SESSION"
    }, {
        "name": "ADD_SESSION"
    }]




    function customdAutoUpload(database, databaseName, data) {
        return new Promise(resolve => {
            var mysqlDs = app.dataSources.mainDB;
            mysqlDs.autoupdate(databaseName, function(err) {
                if (err) resolve(err);
                console.log('\nAutoupdated table `' + databaseName + '`.');
                database.find({}, function(err, db) {
                    if (err) resolve(err);
                    if (db.length != 0) {
                        console.log('\n`' + databaseName + '` has ' + db.length + ' rows.');
                        resolve();
                    } else {
                        database.create(data, function(err, data) {
                            if (err) resolve(err);
                            console.log('\nCreate Dat To `' + databaseName + ' , ' + data.length + ' rows `.');
                            resolve();
                        })
                    }
                })
            })
        })
    }

    function deleteDB() {
        return new Promise(resolve => {
            var mysqlDs = app.dataSources.mainDB;
            const connector = mysqlDs.connector;
            var query = "DROP DATABASE `mgmt-test`"
                // connector.execute(query, null, (err, resultObjects) => {
            connector.execute("CREATE DATABASE `mgmt-test`", null, (err, resultObjects) => {
                resolve()
                    // })
            })
        })
    }

    function addRoleToadmin() {
        return new Promise(resolve => {
            Admin.find({
                "where": {
                    "email": "admin@gelp.com"
                }
            }, function(err, admin) {
                if (err) resolve(err)
                Role.find({
                    "where": {
                        "name": 'super-admin'
                    }
                }, function(err, role) {
                    if (err) resolve(err)
                    RoleMapping.find({
                        "where": {
                            "principalId": admin[0].id
                        }
                    }, function(err, rolemappings) {
                        if (err) resolve(err)
                        if (rolemappings.length == 0) {
                            RoleMapping.create({
                                "principalType": "admin",
                                "principalId": admin[0].id,
                                "roleId": role[0].id
                            }, function(err, rolemapping) {
                                if (err) resolve(err)
                                console.log("create rolemapping to admin")
                                resolve()
                            })
                        } else {
                            resolve()
                        }
                    })
                })

            })
        })
    }


    async function init() {
        try {

            await customdAutoUpload(Category, 'category', categoryData).then(result => {})
            await customdAutoUpload(Admin, 'admin', adminData);
            await customdAutoUpload(Role, 'Role', roleData);
            await customdAutoUpload(RoleMapping, 'RoleMapping', []);
            await addRoleToadmin();
            await customdAutoUpload(AccessToken, 'AccessToken', []);
            await customdAutoUpload(MultiAccessToken, 'MultiAccessToken', []);
            await customdAutoUpload(ACL, 'ACL', []);
            await customdAutoUpload(Subject, 'subject', subjectData);
            await customdAutoUpload(youtuber, 'youtuber', []);
            await customdAutoUpload(country, 'country', countryData);

            await customdAutoUpload(SubCategory, 'subCategory', []);
            await customdAutoUpload(Property, 'property', []);
            await customdAutoUpload(User, 'user', []);
            await customdAutoUpload(userInstitute, 'userInstitute', []);
            await customdAutoUpload(Media, 'media', []);
            await customdAutoUpload(Institute, 'institute', []);
            await customdAutoUpload(restriction, 'restriction', []);
            await customdAutoUpload(InstitutesImages, 'institutesImages', []);
            await customdAutoUpload(instituteAdmin, 'instituteAdmin', []);
            await customdAutoUpload(Branch, 'branch', []);
            await customdAutoUpload(branchImages, 'branchImages', []);
            await customdAutoUpload(branchAdmin, 'branchAdmin', []);
            await customdAutoUpload(venue, 'venue', []);
            await customdAutoUpload(venueProperties, 'venueProperties', []);
            await customdAutoUpload(venueImages, 'venueImages', []);
            await customdAutoUpload(student, 'student', []);
            await customdAutoUpload(verificationCode, 'verificationCode', []);
            await customdAutoUpload(studentPayment, 'studentPayment', []);
            await customdAutoUpload(studentNote, 'studentNote', []);
            await customdAutoUpload(teacher, 'teacher', []);
            await customdAutoUpload(teacherNote, 'teacherNote', []);
            await customdAutoUpload(teacherSubcategory, 'teacherSubcategory', []);
            await customdAutoUpload(waitingList, 'waitingList', []);
            await customdAutoUpload(waitingListStudent, 'waitingListStudent', []);
            await customdAutoUpload(course, 'course', []);
            await customdAutoUpload(supply, 'supply', []);
            await customdAutoUpload(courseImages, 'courseImages', []);
            await customdAutoUpload(session, 'session', []);
            await customdAutoUpload(teacherCourse, 'teacherCourse', []);
            await customdAutoUpload(teacherCoursePayment, 'teacherCoursePayment', []);
            await customdAutoUpload(teacherPayment, 'teacherPayment', []);
            await customdAutoUpload(studentCourse, 'studentCourse', []);
            // await customdAutoUpload(packageStudent, 'packageStudent', []);
            // await customdAutoUpload(packageCourse, 'packageCourse', []);
            await customdAutoUpload(studentSession, 'studentSession', []);
            // await customdAutoUpload(packageStudentPayment, 'packageStudentPayment', []);
            await customdAutoUpload(notification, 'notification', []);
            await customdAutoUpload(notificationType, 'notificationType', notificationTypeData);
            await customdAutoUpload(transaction, 'transaction', []);
            await customdAutoUpload(messageLog, 'messageLog', []);
            await customdAutoUpload(institutePayment, 'institutePayment', []);
            await customdAutoUpload(tag, 'tag', []);
            await customdAutoUpload(studentTag, 'studentTag', []);
            await customdAutoUpload(unit, 'unit', []);
            await customdAutoUpload(onlineSession, 'onlineSession', []);
            await customdAutoUpload(youtuberCourse, 'youtuberCourse', []);
            await customdAutoUpload(onlineSessionWatch, 'onlineSessionWatch', []);
            await customdAutoUpload(podcast, 'podcast', [])
            await customdAutoUpload(podcastSubscribe, 'podcastSubscribe', [])
            await customdAutoUpload(rate, 'rate', [])
            await customdAutoUpload(follower, 'follower', [])
            await customdAutoUpload(invitationCode, 'invitationCode', [])
            await customdAutoUpload(levels, 'levels', [])



        } catch (error) {
            console.log("sssssssssssss")
        }



    }


    async function initTest() {

        await deleteDB();
        await customdAutoUpload(Category, 'category', [])
        await customdAutoUpload(Admin, 'admin', adminData);
        await customdAutoUpload(Role, 'Role', roleData);
        await customdAutoUpload(RoleMapping, 'RoleMapping', []);
        await addRoleToadmin();
        await customdAutoUpload(AccessToken, 'AccessToken', []);
        await customdAutoUpload(MultiAccessToken, 'MultiAccessToken', []);
        await customdAutoUpload(ACL, 'ACL', []);
        await customdAutoUpload(Subject, 'subject', []);
        await customdAutoUpload(SubCategory, 'subCategory', []);
        await customdAutoUpload(Property, 'property', []);
        await customdAutoUpload(User, 'user', []);
        await customdAutoUpload(userInstitute, 'userInstitute', []);
        await customdAutoUpload(Media, 'media', []);
        await customdAutoUpload(Institute, 'institute', []);
        await customdAutoUpload(InstitutesImages, 'institutesImages', []);
        await customdAutoUpload(instituteAdmin, 'instituteAdmin', []);
        await customdAutoUpload(Branch, 'branch', []);
        await customdAutoUpload(branchImages, 'branchImages', []);
        await customdAutoUpload(branchAdmin, 'branchAdmin', []);
        await customdAutoUpload(venue, 'venue', []);
        await customdAutoUpload(venueProperties, 'venueProperties', []);
        await customdAutoUpload(venueImages, 'venueImages', []);
        await customdAutoUpload(student, 'student', []);
        await customdAutoUpload(verificationCode, 'verificationCode', []);
        await customdAutoUpload(teacher, 'teacher', []);
        await customdAutoUpload(teacherSubcategory, 'teacherSubcategory', []);
        await customdAutoUpload(waitingList, 'waitingList', []);
        await customdAutoUpload(waitingListStudent, 'waitingListStudent', []);
        await customdAutoUpload(course, 'course', []);
        await customdAutoUpload(courseImages, 'courseImages', []);
        await customdAutoUpload(session, 'session', []);
        await customdAutoUpload(teacherCourse, 'teacherCourse', []);
        await customdAutoUpload(teacherCoursePayment, 'teacherCoursePayment', []);
        await customdAutoUpload(studentCourse, 'studentCourse', []);
        // await customdAutoUpload(packageStudent, 'packageStudent', []);
        // await customdAutoUpload(packageCourse, 'packageCourse', []);
        await customdAutoUpload(studentSession, 'studentSession', []);
        // await customdAutoUpload(packageStudentPayment, 'packageStudentPayment', []);
        await customdAutoUpload(notification, 'notification', []);
        await customdAutoUpload(notificationType, 'notificationType', []);
        await customdAutoUpload(youtuber, 'youtuber', []);
    }

    console.log("process.env.NODE_ENV")
    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV == 'test') {
        initTest()
    } else {
        init()
    }
};