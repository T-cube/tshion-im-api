'use strict';

module.exports = function(req, res, next) {
  res.sendJson = function(status, data, message) {
    if (!(status instanceof Number)) {
      message = data ? data : '';
      data = status;
    }
    data = {
      status: 200,
      data,
      message
    };
    res.json(data);
  };

  next();
};
