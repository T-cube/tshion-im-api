'use strict';
module.exports = function(app) {
  const Message = require('../../../models/message')(app);
  const Notification = require('../../../vendor/notification')(app);

  return {
    get: {
      ':roomid': {
        docs: {
          name: '获取聊天日志',
          params: [
            { param: 'roomid', type: 'String' },
            { query: 'last', type: 'String' },
            { query: 'pagesize', type: 'Number' }
          ]
        },
        method(req, res, next) {
          console.log('::::::::::::::::::::---------------', req.params, req.query);
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
            { param: 'target', type: 'String' }
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
            { param: 'roomid', type: 'String' },
            { query: 'index', type: 'String' }
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
        des: {
          name: '删除离线消息',
          params: [
            { param: 'roomid', type: 'String' },
            { param: 'target', type: 'String' }
          ]
        },
        method(req, res, next) {
          // Message.offlineMessageCount()
          var user = req.user;
          var { target } = req.params;
          if (user._id.toHexString() == target) {
            return next(req.apiError(400, 'can not delete self offline message in room'));
          }
          Message.deleteOfflineMessage(req.params).then(result => {
            // console.log(result, 'dddsdfsdfsdfsdfsdf')
            res.sendJson({ num: result });
          }).catch(next);
        }
      }
    }
  };
};
