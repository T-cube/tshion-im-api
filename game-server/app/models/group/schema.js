'use strict';
let crypto = require('crypto');

module.exports = {
  name: { type: 'string' },
  creator: { type: 'string|object' },
  owner: { type: 'string|object' },
  avatar: { type: 'string', default: '' },
  // members: { type: 'object' },
  roomid: { type: 'string', default () { return crypto.createHash('sha1').update(+new Date + '' + Math.random().toString().substr(2, 6)).digest('hex'); } },
  // status: { type: 'string', default: 'normal' },
  // type: { type: 'string', default: 'normal' },
  settings: { type: 'object', default: { not_distub: 0, block: 0 } },
  create_at: { type: 'string|number', default () { return new Date; } },
  update_at: { type: 'string|number', default () { return new Date; } }
};
