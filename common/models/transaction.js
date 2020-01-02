'use strict';

module.exports = function (Transaction) {
  Transaction.validatesInclusionOf('type', {
    in: ['receiveCourseSupplies','receiveCourse','debtInCourse']
  });

  
};
