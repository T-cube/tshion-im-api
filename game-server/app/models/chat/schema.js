'use strict';

const SchemaObject = require('schema-object');
//记录每个聊天会话信息，对最后一条聊天数据数据存储
const ChatSchema = new SchemaObject({
  uid1: {type: String, required: true},//uid1 < uid2 保证会话唯一性
  uid2: {type: String, required: true},
  groupId: {type: String},//群id
  chatFrom: {type: Boolean, required: true},//消息1->2 true 2-> 1 false;
  noRead: {type: Number, required: true},//未读消息数
  topTime: {type: Number, default: () => 0},//会话置顶时间
  timestamp: {type: Number, default: () => +new Date},
  type: {type: String, default: 'text', enum: ['text', 'audio', 'video', 'file', 'image', 'link']},
  content: String,
});

module.exports = function (chat) {
  let mChatSchema = new ChatSchema(chat);
  if (mChatSchema.isErrors()) {
    throw new Error('Error: ' + JSON.stringify(mChatSchema.getErrors()[0]));
  }
  if (chat.uid1 > chat.uid2) {
    throw new Error('Error: chat.uid1 > chat.uid2');
  }
  return mChatSchema.toObject();
};
