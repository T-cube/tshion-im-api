'use strict';

module.exports = function oauthCheck() {
  return function(req, res, next) {
    req.app.oauth.authorise()(req, res, next);
  };
};
