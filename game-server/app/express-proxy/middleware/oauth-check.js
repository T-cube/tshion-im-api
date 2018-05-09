'use strict';

module.exports = function oauthCheck() {
  return function(req, res, next) {
    console.log(req.url, req.headers);
    req.app.oauth.authorise()(req, res, next);
  };
};
