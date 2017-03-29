'use strict';
module.exports = {
  content: { type: 'string' },
  from: { type: 'string' },
  target: { type: 'string' },
  roomid: { type: 'string' },
  route: { type: 'string' },
  timestamp: { type: 'string|number', default: () => { return +new Date; } },
  type: { type: 'string', default: 'text' },
  __route__: { type: 'string' }
};
