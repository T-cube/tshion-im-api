'use strict';
let crypto = require('crypto');

module.exports = {
  group: { type: 'string' },
  creator: { type: 'string' },
  members: { type: 'object' },
  roomid: { type: 'string', default () { return crypto.createHash('sha1').update(+new Date + '').digest('hex'); } },
  date_create: { type: 'string|number', default () { return +new Date; } }
};
