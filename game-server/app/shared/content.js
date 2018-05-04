// content.js
// Created by fanyingmao 五月/04/2018
//与客户端共享枚举常量

//成员类型
module.exports.MemberType = {
  owner: 0,//群主
  normal: 1 //普通成员
};

module.exports.MemberStatus = {
  normal: 0
};

//好友邀请
module.exports.FriendRequest = {
  agree: 0,//接受
  reject: 1,//拒绝
};

//好友邀请状态
module.exports.FriendRequestStatue = {
  PADDING: 0,//赘语
  AGREE: 1,//同意
  REJECT: 2,//拒绝
  IGNORE: 3,//忽略
};

//会话消息类型
module.exports.MessageType = {
  text: 0,//普通文本消息
  audio: 1,//录音
  video: 2,//视频
  file: 3,//文件
  image: 4,//图片
  link: 5,//链接
  notice: 6,//群公告
};

//推送title
module.exports.MsgTitle = {
  onChat: 'onChat',//when some one send a message to you will emit this event
  onAdd: 'onAdd',//when a friend login in, will emit this event to notify you
  joinRoom: 'joinRoom',//if some ont want to chat with you, will send message to this event before chat
  onLeave: 'onLeave',//when a friend offline,will emit this event
  friendRequest: 'friendRequest'//好友请求处理
};

