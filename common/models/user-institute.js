'use strict';
var g = require('strong-globalize')();
var debug = require('debug')('loopback:user');

module.exports = function (Userinstitute) {
  Userinstitute.validatesPresenceOf('email', 'email');
  Userinstitute.validatesUniquenessOf('email', {
    message: 'email is not unique'
  });


};
