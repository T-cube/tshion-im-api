'use strict';

module.exports = function(app) {
  const User = require('../../../models/user')(app);
  const Account = require('../../../models/account')(app);

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
          User.user(req.params.user_id, req.user._id).then(user => {
            user.showname = user.nickname || user.name;
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
          User.find(Object.assign(req.query, { user: user._id })).then(users => {
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
      'device-token': {
        docs: {
          name: '保存设备推送号',
          params: [
            { key: 'deviceToken', type: 'String' },
            { key: 'client', type: 'String' },
            { key: 'brand', type: 'String' },
          ]
        },
        method(req, res, next) {
          var { deviceToken, client, brand } = req.body;
          var user = req.user;

          new Account({
            uid: user._id.toHexString(),
            client,
            deviceToken,
            brand
          }).saveDeviceToken().then(value => {
            res.sendJson(value);
          }).catch(next);
        }
      },
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
          let self = user._id.toHexString();
          if (self == user_id)
            return next(req.apiError(400, 'can not add self as a friend '));

          User.sendRequest(Object.assign(req.body, { from: user._id })).then(request => {
            res.sendJson(request);
            // var { from, user_id: target } = req.body;
            if (request)
              req.pomelo.rpc.push.pushRemote.notifyClient(null, 'friendRequest', {
                  request: request._id,
                  from: user._id.toHexString(),
                  type: request.update_at ? 'update' : 'new'
                },
                user_id,
                function(err) {
                  if (err) {
                    console.error('notify error:', err);
                  }
                });
          }).catch(next);
        }
      },
      'room-request': {
        docs: {
          name: '邀请好友加入房间请求',
          params: [
            { key: 'user_id', type: 'String' },
            { key: 'from', type: 'String' },
            { key: 'message', type: 'String' },
            { key: 'style', type: 'Number'} //style的取值，0代表语音，1代表视频
          ]
        },
        method(req, res, next) {
          let user = req.user;
          let { user_id, message, style } = req.body;
          let self = user._id.toHexString();
          if(!(style == 0 || style == 1))
            return next(req.apiError(400, 'lack style or style is not properly '));
          if (self == user_id)
            return next(req.apiError(400, 'can not add self as a friend '));

          User.getFriendInfo(user._id, user_id).then(exist => {
            res.sendJson(exist);
            if (exist)
              req.pomelo.rpc.push.pushRemote.notifyClient(null, 'roomRequest', {
                  from: user._id.toHexString(),
                  style: style,
                  message: message,
                  type: 'new'
                },
                user_id,
                function(err) {
                  if (err) {
                    console.error('notify error:', err);
                  }
                });
          }).catch(next);
        }
      },
      'room-request-feedback': {
        docs: {
          name: '回应好友加入房间请求',
          params: [
            { key: 'user_id', type: 'String' },
            { key: 'from', type: 'String' },
            { key: 'message', type: 'String' },
            { key: 'style', type: 'Number'}, //style的取值，0代表语音，1代表视频
            { key: 'choice', type: 'Number'} //choice的取值， 0代表接受，1代表拒绝
          ]
        },
        method(req, res, next) {
          let user = req.user;
          let { user_id, message, style, choice } = req.body;
          let self = user._id.toHexString();
          if(!(style == 0 || style == 1))
            return next(req.apiError(400, 'lack style or style is not properly '));
          if(!(choice == 0 || choice == 1))
            return next(req.apiError(400, 'lack choice or choice is not properly '));
          if (self == user_id)
            return next(req.apiError(400, 'can not add self as a friend '));

          User.getFriendInfo(user._id, user_id).then(exist => {console.log(message);
            res.sendJson(exist);
            if (exist)
              req.pomelo.rpc.push.pushRemote.notifyClient(null, 'roomRequestFeedback', {
                  from: user._id.toHexString(),
                  message: message,
                  style: style,
                  choice: choice,
                  type: 'new'
                },
                user_id,
                function(err) {
                  if (err) {
                    console.error('notify error:', err);
                  }
                });
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

            req.pomelo.rpc.push.pushRemote.notifyClient(null, 'friendRequest', {
              request: request_id,
              receiver: result.receiver,
              from: result.from,
              type: status
            }, result.from, function(err) {
              if (err) {
                console.error('resolve notify error:', err);
              }
            });
          }).catch(next);
        }
      }
    },
    put: {
      'friend/distub/:friend_id': {
        docs: {
          name: '好友免打扰',
          params: [
            { param: 'friend_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          var user = req.user;
          var { friend_id } = req.params;

          User.getFriendInfo(user._id, friend_id).then(friend => {
            if (!friend) {
              return next(req.apiError(400, 'wrong friend_id'));
            }

            var status = (friend.settings || {}).not_distub;

            return User.changeFriendDistubMode(user._id, friend_id, status == 1 ? 0 : 1).then(() => {
              res.sendJson(200);
            });

          }).catch(next);
        }
      },
      'friend/block/:friend_id': {
        docs: {
          name: '屏蔽好友',
          params: [
            { param: 'friend_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          var user = req.user;
          var { friend_id } = req.params;

          User.getFriendInfo(user._id, friend_id).then(friend => {
            if (!friend) {
              return next(req.apiError(400, 'wrong friend_id'));
            }
            var status = (friend.settings || {}).block;
            return User.changeFriendBlockMode(user._id, friend_id, status == 1 ? 0 : 1).then(() => {
              res.sendJson(200);
            }).catch(next);
          }).catch(next);
        }
      },
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
      'friend/:friend_id': {
        doc: {
          name: '删除好友',
          params: [
            { param: 'friend_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          var user = req.user;
          var friend_id = req.params.friend_id;

          User.deleteFriend(user._id, friend_id).then(() => {
            res.sendJson('ok');

            req.pomelo.rpc.push.pushRemote.notifyClient(null, 'friend.delete', {
              friend: user._id.toHexString()
            }, friend_id, function(err) {
              console.error('notifi error:', err);
            });
          }).catch(next);
        }
      },
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
