'use strict';
module.exports = function (app) {
  const Badger = require('../../../models/badge')(app);
  const Account = require('../../../models/account')(app);
  return {
    get: {
      'device-tokens/:uid': {
        docs: {
          name: '获取用户 devices tokens',
          params: [
            {
              param: 'uid',
              type: String
            }
          ]
        },
        method(req, res, next) {
          let uid = req.params.uid;

          Account
            .getDeviceToken({uid})
            .then(results => {
              let tokens = results.map(result => result.deviceToken);
              res.sendJson(tokens);
            })
            .catch(next);
        }
      }
    },
    put: {
      'reset/:uid': {
        docs: {
          name: '清空指定用户的应用角标数',
          params: [
            {
              param: 'uid',
              type: 'String'
            }
          ]
        },
        method(req, res, next) {
          Badger
            .setBadge(req.params, 0)
            .then(() => {
              res.sendJson({});
            })
            .catch(next);
        }
      }
    }
  };
};
