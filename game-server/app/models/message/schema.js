'use strict';

const SchemaObject = require('schema-object');
const {MessageType, ChatType} = require('../../shared/constant');
//字段意义参看chat
const MessageSchema = new SchemaObject({
  uid1: {type: String, required: true},
  uid2: {type: String, required: true},
  group: {type: String},
  system: {type: String},
  chatType: {type: Number, default: ChatType.single, enum: [ChatType.single, ChatType.group, MessageType.system]},//会话类型群聊，
  route: String,
  timestamp: {type: Number, default: () => +new Date},
  type: {
    type: Number,
    default: MessageType.text,
    enum: [MessageType.text, MessageType.audio, MessageType.video, MessageType.file, MessageType.image, MessageType.link, MessageType.notice]
  },
  content: String,
  audio: String,
  file: String,
  image: String,
  __route__: String,
  duration: Number
});

module.exports = function (msg) {
  return new MessageSchema(msg).toObject();
};
