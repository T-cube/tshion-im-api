'use strict';
let crypto = require('crypto');

module.exports = {
  name: { type: 'string' },
  creator: { type: 'string|object' },
  members: { type: 'object' },
  roomid: { type: 'string', default () { return crypto.createHash('sha1').update(+new Date + '').digest('hex'); } },
  status: { type: 'string', default: 'normal' },
  type: { type: 'string', default: 'normal' },
  create_at: { type: 'string|number', default () { return new Date; } }
};
