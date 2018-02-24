'use strict';
module.exports = function(app) {
  const User = require('../../../models/user')(app);
  return {
    get: {
      '': {
        docs: {
          name: '获取用户信息',
          params: [
            { query: 'name', type: 'String' },
            { query: 'keyword', type: 'String|Number' },
            { query: 'mobile', type: 'Number' },
            { query: 'user', type: 'String' }
          ]
        },
        method(req, res, next) {
          User.find(req.query).then(users => {
            res.json(users);
          }).catch(next);
        }
      },
      'friend-request/receiver/:receiver': {
        docs: {
          name: '获取收到的好友请求',
          params: [
            { param: 'receiver', type: 'String' }
          ]
        },
        method(req, res, next) {
          User.getFriendRequest(req.params).then(requests => {
            res.json(requests);
          }).catch(next);
        }
      }
    },
    post: {
      'friend-request': {
        docs: {
          name: '添加好友请求',
          params: [
            { key: 'user_id', type: 'String' },
            { key: 'from', type: 'String' },
            { key: 'mark', type: 'String' }
          ]
        },
        method(req, res, next) {
          User.sendRequest(req.body).then(request => {
            res.json(request);
            let { from, user_id: target } = req.body;

          }).catch(next);
        }
      }
    }
  };
};
