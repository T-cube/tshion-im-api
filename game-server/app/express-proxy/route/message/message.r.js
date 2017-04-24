'use strict';

module.exports = function(app) {
  const Message = require('../../../models/message')(app);


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
          Message.getList(Object.assign(req.params, req.query)).then(result => {
            res.json(result);
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
          console.log(req.params);

          Message.offlineMessageCount(req.params).then(counts => {
            res.json(counts);
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
          Message.deleteOfflineMessage(req.params).then(result => {
            res.json(result);
          }).catch(next);
        }
      }
    }
  };
};