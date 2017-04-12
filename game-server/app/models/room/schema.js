module.exports = {
  roomid: { type: 'string' },
  members: { type: 'object' },
  createAt: { type: 'string|object', default: () => new Date }
};