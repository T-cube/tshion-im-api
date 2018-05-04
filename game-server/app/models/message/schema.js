'use strict';

const SchemaObject = require('schema-object');
const {MessageType} = require('../../shared/constant');
const MessageSchema = new SchemaObject({
  content: String,
  from: {type: String, required: true},
  target: {type: String, required: true},
  roomid: String,
  route: String,
  group: String,
  timestamp: {type: Number, default: () => +new Date},
  type: {
    type: Number,
    default: MessageType.text,
    enum: [MessageType.text, MessageType.audio, MessageType.video, MessageType., 'image', 'link']
  },
  audio: String,
  file: String,
  image: String,
  __route__: String,
  duration: Number
});

module.exports = function (msg) {
  return new MessageSchema(msg).toObject();
};
