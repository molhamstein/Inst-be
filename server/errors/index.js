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

module.exports.user = {
  phonenumberIsAlreadyUsed: function () {
    return new cError(454, 'phonenumber is already used', 454);
  },

  userNotFound: function () {
    return new cError(455, 'user not found', 455);
  },
  userInInstituteAlready: function () {
    return new cError(456, 'user in institute already', 456);
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
  }
}
