'use strict';

const SchemaObject = require('schema-object');

const MessageSchema = new SchemaObject({
  content: String,
  from: String,
  target: String,
  roomid: String,
  route: String,
  group: String,
  timestamp: { type: Number, default: () => +new Date },
  type: { type: String, default: 'text', enum: ['text', 'audio', 'video', 'file', 'image', 'link'] },
  audio: String,
  file: String,
  image: String,
  __route__: String,
  duration: Number
});

module.exports = function(msg) {
  return new MessageSchema(msg).toObject();
};
