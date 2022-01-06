'use strict';

module.exports = function(Config) {

    Config.validatesInclusionOf('typePromoCode', { in: ['PERCENTAGE', 'FIXED']
    });
    Config.validatesInclusionOf('type', { in: ['INVITATION', 'COURSE_PROMO_CODE']
    });

};