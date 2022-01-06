'use strict';

module.exports = function(Youtubercoursepromocode) {

    Youtubercoursepromocode.validatesInclusionOf('type', { in: ['PERCENTAGE', 'FIXED']
    });
    Youtubercoursepromocode.validatesInclusionOf('reason', { in: ['INVITATION', 'ACCEPT_INVITATION']
    });


};