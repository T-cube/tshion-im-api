// noticeSchema.js
// Created by fanyingmao 五月/07/2018
//
const SchemaObject = require('schema-object');
//记录每个聊天会话信息，对最后一条聊天数据数据存储
const NoticeSchema = new SchemaObject({
  groupId: {type: String, required: true},//群id
  timestamp: {type: Number, default: () => +new Date},
  title: {type: String, required: true},
  content: {type: String, required: true},
  sender: {type: String, required: true},
});

module.exports = function (notice) {
  let mNoticeSchema = new NoticeSchema(notice);
  if (mNoticeSchema.isErrors()) {
    throw new Error(mNoticeSchema.getErrors()[0].errorMessage);
  }
  return mNoticeSchema.toObject();
};
