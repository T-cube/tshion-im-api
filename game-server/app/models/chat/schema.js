'use strict';

const SchemaObject = require('schema-object');
const {MessageType, ChatType} = require('../../shared/constant');
//记录每个聊天会话信息，对最后一条聊天数据数据存储
const ChatSchema = new SchemaObject({
  uid1: {type: String},//uid1 < uid2 保证会话唯一性
  uid2: {type: String},//当为group，或system消息时用户id在uid1,uid2为空
  group: {type: String},
  system: {type: String},
  chatType: {type: Number, default: ChatType.single, enum: [ChatType.single, ChatType.group, MessageType.system]},//会话类型群聊，
  chatFrom: {type: Boolean, required: true},//消息1->2 true 2-> 1 false; 群与系统消息为2
  noRead: {type: Number, required: true},//未读消息数
  topTime: {type: Number, default: () => 0},//会话置顶时间
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

module.exports = function (chat) {
  let mChatSchema = new ChatSchema(chat);
  if (mChatSchema.isErrors()) {
    throw new Error(mChatSchema.getErrors()[0].errorMessage);
  }
  if (chat.uid1 > chat.uid2) {
    throw new Error('Error: chat.uid1 > chat.uid2');
  }
  return mChatSchema.toObject();
};
