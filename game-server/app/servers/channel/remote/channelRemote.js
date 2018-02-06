'use strict';

module.exports = function(app) {
  return new ChannelRemote(app);
};

var ChannelRemote = function(app) {
  this.app = app;
  this.channelMap = new Map();
};

let prototype = ChannelRemote.prototype;

prototype.setChannel = function(name, channel, cb) {
  console.log('set channel----------',name,channel)
  this.channelMap.set(name, channel);
  cb(null);
};

prototype.getChannel = function(name, cb) {
  console.log('get channel ---------------',this.channelMap.get(name))
  this.channelMap.get(name)
  cb(null, this.channelMap.get(name));
};
