'use strict';

const _ = require('./util');

module.exports = function(err, msg, resp, session, next) {
  let type = _.getType(err);

  if (type == 'object') {
    err.code || (err.code = 500);
    return next(null, err);
  }

  let error = { error_description: err, code: 500 };
  next(null, error);
};
