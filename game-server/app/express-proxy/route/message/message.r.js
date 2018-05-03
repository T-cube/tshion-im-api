'use strict';
module.exports = function (app) {
  const Message = require('../../../models/message')(app);
  const Chat = require('../../../models/chat')(app);
  const Notification = require('../../../vendor/notification')(app);

  return {
    get: {
      'lastList': {
        docs: {
          name: '最近联系人列表',
          params: []
        },
        method(req, res, next) {
          // console.log('123456789123456789', req.query);
          let user_id = req.user.id;
          Chat.findUserChat(user_id).then(result => {
            res.sendJson(result);
          }).catch(next);
        }
      },
      ':roomid': {
        docs: {
          name: '获取聊天日志',
          params: [
            {param: 'roomid', type: 'String'},
            {query: 'last', type: 'String'},
            {query: 'pagesize', type: 'Number'}
          ]
        },
        method(req, res, next) {
          // console.log('123456789123456789', req.query);
          Message.getList(Object.assign(req.params, req.query)).then(result => {
            // console.log(123,result.list.length)
            res.sendJson(result);
          }).catch(next);
        }
      },
      'offline/:target': {
        docs: {
          name: '获取离线消息统计',
          params: [
            {param: 'target', type: 'String'}
          ]
        },
        method(req, res, next) {
          Message.offlineMessageCount(req.params).then(counts => {
            res.sendJson(counts);
          }).catch(next);
        }
      },
      ':roomid/newly': {
        docs: {
          name: '获取最新的聊天记录',
          params: [
            {param: 'roomid', type: 'String'},
            {query: 'index', type: 'String'}
          ],
        },
        method(req, res, next) {
          Message.getNewLyList(Object.assign(req.params, req.query)).then(result => {
            // console.log(result)
            res.sendJson(result);
          }).catch(next);
        }
      }
    },
    delete: {
      'offline/:roomid/:target': {
        docs: {
          name: '删除离线消息',
          params: [
            {param: 'roomid', type: 'String'},
            {param: 'target', type: 'String'}
          ]
        },
        method(req, res, next) {
          // Message.offlineMessageCount()
          var user = req.user;
          var {target} = req.params;
          if (user.id == target) {
            return next(req.apiError(400, 'can not delete self offline message in room'));
          }
          Message.deleteOfflineMessage(req.params).then(result => {
            // console.log(result, 'dddsdfsdfsdfsdfsdf')
            res.sendJson({num: result});
          }).catch(next);
        }
      },
      'top/:chat_id': {
        docs: {
          name: '会话取消置顶',
          params: [
            {param: 'chat_id', type: 'String'},
          ]
        },
        method(req, res, next) {
          let {chat_id} = req.params;
          Chat.setTopTime(chat_id, 0).then(result => {
            res.sendJson({num: result.matchedCount});
          }).catch(next);
        }
      },
    },
    put: {
      'readChat': {
        docs: {
          name: '对话消息已读',
          params: [
            {key: 'target', type: 'String'},
            {key: 'group', type: 'String'}
          ]
        },
        method(req, res, next) {
          // console.log('123456789123456789', req.query);
          let user_id = req.user.id;
          let {target, group} = req.params;
          Chat.readChat(user_id, target, group).then(result => {
            res.sendJson(result);
          }).catch(next);
        }
      },
    },
    post: {
      'top/:chat_id': {
        docs: {
          name: '会话置顶',
          params: [
            {param: 'chat_id', type: 'String'},
          ]
        },
        method(req, res, next) {
          let {chat_id} = req.params;
          let topTime = Date.now();
          Chat.setTopTime(chat_id, topTime).then(result => {
            res.sendJson({num: result.matchedCount, topTime: topTime});
          }).catch(next);
        }
      },
    }
  };
};
