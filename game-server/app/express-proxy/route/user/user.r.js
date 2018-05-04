'use strict';
const {MsgTitle} = require('../../../shared/constant');
module.exports = function (app) {
  const User = require('../../../models/user')(app);
  return {
    get: {
      'info/:user_id': {
        docs: {
          name: '获取用户详情',
          params: [
            {param: 'user_id', type: 'String'}
          ]
        },
        method(req, res, next) {
          User.user(req.params.user_id).then(user => {
            res.sendJson(user);
          }).catch(next);
        }
      },
      'find': {
        docs: {
          name: '查找非好友用户',
          params: [
            {query: 'name', type: 'String'},
            {query: 'keyword', type: 'String|Number'},
            {query: 'mobile', type: 'Number'}
          ]
        },
        method(req, res, next) {
          var user = req.user;
          // console.log('/user',user);
          User.find(Object.assign(req.query, {user: user.id})).then(users => {
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

          User.getFriendGroupList(user.id).then(groups => {
            res.sendJson(groups);
          }).catch(next);
        }
      },
      'friend-request/receiver': {
        docs: {
          name: '获取收到的好友请求',
          params: [
            {param: 'receiver', type: 'String'},
            {query: 'page', type: 'Number'},
            {query: 'pagesize', type: 'Number'}
          ]
        },
        method(req, res, next) {
          var user = req.user;
          User.getFriendRequest({receiver: user.id}, req.query).then(requests => {
            res.sendJson(requests);
          }).catch(next);
        }
      },
      'friends/info/': {
        docs: {
          name: '获取所有好友信息',
          params: []
        },
        method(req, res, next) {
          var user = req.user;
          User.getAllFriendsInfo(user.id).then(friends => {
            res.sendJson(friends);
          }).catch(next);
        }
      },
      'friends/info/:user_id/:group_id': {
        docs: {
          name: '获取分组好友信息',
          params: [
            {param: 'user_id', type: 'String'},
            {param: 'group_id', type: 'String'}
          ]
        },
        method(req, res, next) {
          var user = req.user;
          console.log(req.params);
          User.getGroupFriendsInfo(req.params.group_id, user.id).then(friends => {
            res.sendJson(friends);
          }).catch(next);
        }
      },
      'friends': {
        docs: {
          name: '获取好友列表',
          params: [
            {param: 'user_id', type: 'String'}
          ]
        },
        method(req, res, next) {
          var user = req.user;
          User.getFriends(user.id).then(result => {
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
            {key: 'name', type: 'String'}
          ]
        },
        method(req, res, next) {
          var user = req.user;

          User.createFriendGroup(req.body.name, user.id).then(group => {
            res.sendJson(group);
          }).catch(next);
        }
      },
      'friend-request': {
        docs: {
          name: '添加好友请求',
          params: [
            {key: 'user_id', type: 'String'},
            // { key: 'from', type: 'String' },
            {key: 'mark', type: 'String'}
          ]
        },
        method(req, res, next) {
          let user = req.user;
          let {user_id} = req.body;
          if (user.id === user_id)
            return next(req.apiError(400, 'can not add self as a friend '));

          User.sendRequest(Object.assign(req.body, {from: user.id})).then(request => {
            res.sendJson(request);
            // var { from, user_id: target } = req.body;
            req.pomelo.rpc.push.pushRemote.notifyClient(null, MsgTitle.friendRequest, {
              request: request._id,
              from: user.id,
              type: request.update_at ? 'update' : 'new'
            }, user_id, function (err) {
              if (err) {
                console.error('notify error:', err);
              }
            });
          }).catch(next);
        }
      },
      'friend-request/:request_id': {
        docs: {
          name: '接受/拒绝好友请求',
          params: [
            {key: 'request_id', type: 'String'},
            {
              param: 'status',
              enum: {
                values: ['reject', 'agree']
              }
            }
          ]
        },
        method(req, res, next) {
          var {request_id} = req.params;
          var {status} = req.body;
          var user = req.user;
          User.handleFriendRequest(status, request_id, user.id).then(result => {
            res.sendJson(result);

            req.pomelo.rpc.push.pushRemote.notifyClient(null, MsgTitle.friendRequest, {
              request: request_id,
              receiver: result.receiver,
              from: result.from,
              type: status
            }, request_id, function (err) {
              if (err) {
                console.error('resolve notify error:', err);
              }
            });
          }).catch(
            next);
        }
      }
    },
    put: {
      'friend/info/:friend_id': {
        docs: {
          name: '修改好友信息',
          params: [
            {param: 'friend_id', type: 'String'},
            {key: 'nickname', type: 'String'}
          ]
        },
        method(req, res, next) {
          var user = req.user;

          User.updateFriendInfo(req.params.friend_id, user.id, req.body).then(friend => {
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
            {param: 'request_id', type: 'String'}
          ]
        },
        method(req, res, next) {
          var user = req.user;

          User.devareRequest(req.params.request_id, user.id).then(result => {
            res.sendJson(result);
          }).catch(next);
        }
      }
    }
  };
};
