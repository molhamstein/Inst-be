'use strict';

module.exports = function (app) {
  var Category = app.models.Category;
  var Subject = app.models.Subject;
  var Admin = app.models.Admin;
  var Role = app.models.Role
  var RoleMapping = app.models.RoleMapping;
  var AccessToken = app.models.AccessToken;
  var MultiAccessToken = app.models.MultiAccessToken;
  var ACL = app.models.ACL;
  var SubCategory = app.models.SubCategory;
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
    "email": "admin@mgmt.com",
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
      mysqlDs.autoupdate(databaseName, function (err) {
        if (err) resolve(err);
        console.log('\nAutoupdated table `' + databaseName + '`.');
        database.find({}, function (err, db) {
          if (err) resolve(err);
          if (db.length != 0) {
            console.log('\n`' + databaseName + '` has ' + db.length + ' rows.');
            resolve();
          } else {
            database.create(data, function (err, data) {
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
          "email": "admin@mgmt.com"
        }
      }, function (err, admin) {
        if (err) resolve(err)
        Role.find({
          "where": {
            "name": 'super-admin'
          }
        }, function (err, role) {
          if (err) resolve(err)
          RoleMapping.find({
            "where": {
              "principalId": admin[0].id
            }
          }, function (err, rolemappings) {
            if (err) resolve(err)
            if (rolemappings.length == 0) {
              RoleMapping.create({
                "principalType": "admin",
                "principalId": admin[0].id,
                "roleId": role[0].id
              }, function (err, rolemapping) {
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
    await customdAutoUpload(Category, 'category', categoryData).then(result => {})
    await customdAutoUpload(Admin, 'admin', adminData);
    await customdAutoUpload(Role, 'Role', roleData);
    await customdAutoUpload(RoleMapping, 'RoleMapping', []);
    await addRoleToadmin();
    await customdAutoUpload(AccessToken, 'AccessToken', []);
    await customdAutoUpload(MultiAccessToken, 'MultiAccessToken', []);
    await customdAutoUpload(ACL, 'ACL', []);
    await customdAutoUpload(Subject, 'subject', subjectData);
    await customdAutoUpload(SubCategory, 'subCategory', subCategoryData);
    await customdAutoUpload(Property, 'property', propertyData);
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
  }

  console.log("process.env.NODE_ENV")
  console.log(process.env.NODE_ENV)
  if (process.env.NODE_ENV == 'test') {
    initTest()
  } else {
    init()
  }
};
