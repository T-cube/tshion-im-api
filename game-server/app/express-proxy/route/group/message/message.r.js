module.exports = function (app) {
  return {
    get: {
      'offline/:roomid': {
        docs: {

          name: '获取群离线消息',
          params: [
            {
              param: 'roomid',
              type: 'String'
            }
          ]
        },
        method(req, res, next) {}
      }
    }
  };
};