module.exports = {
  roomid: { type: 'string' },
  members: { type: 'object' },
  cid: { type: 'string|number' },
  create_at: { type: 'string|number', default: () => +new Date },
  last_active: { type: 'string|number', default: () => +new Date }

};