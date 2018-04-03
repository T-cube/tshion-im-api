'use strict';

module.exports = function(app) {
  const Group = require('../../../models/group')(app);


  return {
    post: {
      '': {
        docs: {
          name: '创建群组',
          params: [
            { key: 'members', type: 'Array' },
            { key: 'creator', type: 'String' }
          ]
        },
        method(req, res, next) {

        }
      }
    }
  };
};
