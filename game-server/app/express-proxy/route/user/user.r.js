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
            res.sendJson(user);
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
          User.find(Object.assign(req.query, { user_id: user.id })).then(users => {
            res.sendJson(users);
          }).catch(next);
        }
      },
      'friend/groups': {
        docs: {
          name: '获取用户好友分组列表',
        },
        method(req, res, next) {
          var user = req.user;

          User.getFriendGroupList(user._id).then(groups => {
            res.sendJson(groups);
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
            res.sendJson(requests);
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
            res.sendJson(friends);
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
          var user = req.user;
          console.log(req.params)
          User.getGroupFriendsInfo(req.params.group_id, user._id).then(friends => {
            res.sendJson(friends);
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
            res.sendJson(result || {});
          }).catch(next);
        }
      }
    },
    post: {
      'friend/group': {
        docs: {
          name: '创建好友分组',
          params: [
            { key: 'name', type: 'String' }
          ]
        },
        method(req, res, next) {
          var user = req.user;

          User.createFriendGroup(req.body.name, user._id).then(group => {
            res.sendJson(group);
          }).catch(next);
        }
      },
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
          var { user_id } = req.body;
          if (user._id == user_id)
            return next(req.apiError(400, 'can not add self as a friend '));

          User.sendRequest(Object.assign(req.body, { from: user._id })).then(request => {
            res.sendJson(request);
            // var { from, user_id: target } = req.body;

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
          var { request_id } = req.body;
          var { status } = req.params;
          var user = req.user;
          User.handleFriendRequest(status, request_id, user._id).then(result => {
            res.sendJson(result);
          }).catch(next);
        }
      }
    },
    put: {
      'friend/info/:friend_id': {
        docs: {
          name: '修改好友信息',
          params: [
            { param: 'friend_id', type: 'String' },
            { key: 'nickname', type: 'String' }
          ]
        },
        method(req, res, next) {
          var user = req.user;

          User.updateFriendInfo(req.params.friend_id, user._id, req.body).then(friend => {
            res.sendJson(friend);
          }).catch(next);
        }
      }
    },
    delete: {
      'friend-request/:request_id': {
        docs: {
          name: '删除好友请求',
          params: [
            { param: 'request_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          var user = req.user;

          User.devareRequest(req.params.request_id, user._id).then(result => {
            res.sendJson(result);
          }).catch(next);
        }
      }
    }
  };
};
