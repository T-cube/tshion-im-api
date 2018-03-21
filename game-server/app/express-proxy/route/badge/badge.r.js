'use strict';
module.exports = function(app) {
  const Badger = require('../../../models/badge')(app);
  return {
    put: {
      'reset/:uid': {
        docs: {
          name: '清空指定用户的应用角标数',
          params: [
            { param: 'uid', type: 'String' }
          ]
        },
        method(req, res, next) {
          console.log('wowowowowowowowowowoowowowwo');
          Badger.setBadge(req.params, 0).then(() => {
            res.json({});
          }).catch(next);
        }
      }
    }
  };
};
