'use strict';

module.exports = function(app) {
  const User = require('../../../models/user')(app);
  return {
    get: {
      ':user_id': {
        docs: {
          name: '获取用户详情',
          params: [
            { param: 'user_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          User.user(req.params.user_id).then(user => {
            res.json(user);
          }).catch(next);
        }
      },
      '': {
        docs: {
          name: '获取用户信息',
          params: [
            { query: 'name', type: 'String' },
            { query: 'keyword', type: 'String|Number' },
            { query: 'mobile', type: 'Number' }
          ]
        },
        method(req, res, next) {
          var user = req.user;
          // console.log('/user',user);
          User.find(Object.assign(req.query, { user: user._id })).then(users => {
            res.json(users);
          }).catch(next);
        }
      },
      'friend-request/receiver/:receiver': {
        docs: {
          name: '获取收到的好友请求',
          params: [
            { param: 'receiver', type: 'String' },
            { query: 'page', type: 'Number' },
            { query: 'pagesize', type: 'Number' }
          ]
        },
        method(req, res, next) {
          var user = req.user;
          User.getFriendRequest({ receiver: user._id }, req.query).then(requests => {
            res.json(requests);
          }).catch(next);
        }
      },
      'friends/info/:user_id': {
        docs: {
          name: '获取所有好友信息',
          params: [
            { param: 'user_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          var user = req.user;
          User.getAllFriendsInfo(user._id).then(friends => {
            res.json(friends);
          }).catch(next);
        }
      },
      'friends/info/:user_id/:group_id': {
        docs: {
          name: '获取分组好友信息',
          params: [
            { param: 'user_id', type: 'String' },
            { param: 'group_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          User.getGroupFriendsInfo(req.params.group_id).then(friends => {
            res.json(friends);
          }).catch(next);
        }
      },
      'friends/:user_id': {
        docs: {
          name: '获取好友列表',
          params: [
            { param: 'user_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          var user = req.user;
          User.getFriends(user._id).then(result => {
            res.json(result || {});
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
          var user = req.user;
          let { user_id } = req.body;
          if (user._id == user_id)
            return next(req.apiError(400, 'can not add self as a friend '));

          User.sendRequest(Object.assign(req.body, { from: user._id })).then(request => {
            res.json(request);
            // let { from, user_id: target } = req.body;

          }).catch(next);
        }
      },
      'friend-request/:status': {
        docs: {
          name: '接受/拒绝好友请求',
          params: [
            { key: 'request_id', type: 'String' },
            {
              param: 'status',
              enum: {
                values: ['reject', 'agree']
              }
            }
          ]
        },
        method(req, res, next) {
          let { request_id } = req.body;
          let { status } = req.params;
          var user = req.user;
          User.handleFriendRequest(status, request_id, user._id).then(result => {
            res.json(result);
          }).catch(next);
        }
      }
    }
  };
};
