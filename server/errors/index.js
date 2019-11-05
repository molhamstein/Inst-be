const cError = require('./cError');

module.exports.global = {

  notFound: function () {
    return new cError(450, 'object not found', 450);
  },
  alreadyDeactive: function () {
    return new cError(451, 'object already deactive', 451);
  },
  alreadyActive: function () {
    return new cError(452, 'object already active', 452);
  },
  authorization: function () {
    return new cError(401, 'Authorization Required', 401);
  }
};

module.exports.notFound = {
  instituteNotFound: function () {
    return new cError(490, 'institute not found', 490);
  },
  branchNotFound: function () {
    return new cError(491, 'branch not found', 491);
  },
  courseNotFound: function () {
    return new cError(492, 'course not found', 492);
  },
  studentNotFound: function () {
    return new cError(493, 'student not found', 493);
  }
}
module.exports.user = {
  phonenumberIsAlreadyUsed: function () {
    return new cError(454, 'phonenumber is already used', 454);
  },

  userNotFound: function () {
    return new cError(455, 'user not found', 455);
  },
  userInInstituteAlready: function () {
    return new cError(456, 'user in institute already', 456);
  },
  codeNotFound: function () {
    return new cError(459, 'code not found', 459);
  },
  codeNotActive: function () {
    return new cError(460, 'code not active', 460);
  },
  oldPasswordIsWrong: function () {
    return new cError(467, 'old password is wrong', 467);
  }


}


module.exports.institute = {

  justOneBranchIsMain: function () {
    return new cError(453, 'just one branch is main', 453);
  },
  instituteIdIsRequired: function () {
    return new cError(457, 'institute id is required', 457);
  }
};

module.exports.waitingList = {

  studentInwaitingListlready: function () {
    return new cError(458, 'student in waiting list already', 458);
  },
  duplicateWaitingList: function () {
    return new cError(468, 'duplicate waiting list', 468);
  },
}

module.exports.course = {

  sessionHasError: function (data) {
    return new cError(461, 'session has error', 461, data);
  },
  teacherAlreadyInCourse: function () {
    return new cError(462, 'teacher already in course', 462);
  },
  studentAlreadyInCourse: function () {
    return new cError(463, 'student already in course', 463);
  },
  studentAlreadyInMultiCourse: function (data) {
    return new cError(464, 'student already in course', 464, data);
  },
  multiCourseIsFull: function (data) {
    return new cError(465, 'multi course is full', 465, data);
  },
  studentNotInQueue: function () {
    return new cError(466, 'student not in queue', 466);
  }

}
