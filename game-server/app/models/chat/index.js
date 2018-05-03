// index.js.js
// Created by fanyingmao 四月/27/2018
// 用户聊天会话数据操作
let schema = require('./schema');

module.exports = function (app) {
  const ChatCollection = app.db.collection('chat');
  const ObjectID = app.get('ObjectID');

  return class Chat {
    constructor() {

    }

    /**
     * 创建或更新会话
     * @param msg 消息内容
     * @returns {Promise<any>}
     */
    static insertOrUpdate(msg) {
      let chat = Chat.msgToChat(msg);
      let schemaChat;
      let query;
      if (!chat.groupId) {//单聊
        query = {uid1: chat.uid1, uid2: chat.uid2};
      }
      else {//群聊
        query = {$or: [{uid1: chat.uid1}, {uid2: chat.uid2}], groupId: chat.groupId};
      }
      return new Promise((resolve) => {
        ChatCollection.find(query).toArray().then(docs => {
          if (docs.length === 0) {
            chat.noRead = 1;
            schemaChat = schema(chat);
            ChatCollection.insertOne(schemaChat).finally(() => {
              resolve();
            });
          }
          else if (docs.length === 1) {
            if (docs[0].chatFrom !== chat.chatFrom) {
              chat.noRead = 1;
            }
            else {
              chat.noRead = docs[0].noRead + 1;
            }
            schemaChat = schema(chat);
            ChatCollection.updateOne({_id: docs[0]._id}, schemaChat).finally(() => {
              resolve();
            });
          }
          else {
            throw Error('insertOrUpdate more then one ' + __filename);
          }
        });
      });
    }

    /**
     * 获取用户最近联系人/群
     * @param userId
     * @returns {Promise}
     */
    static findUserChat(userId) {
      return new Promise((resolve, reject) => {
        ChatCollection.find({$or: [{uid1: userId}, {uid2: userId}]}).sort({
          topTime: 1,
          timestamp: 1
        }).toArray().then(docs => {
          if (!docs) {
            reject(docs);
          }
          else {
            resolve(docs.map(item => {
              return Chat.chatToMsg(item, userId);
            }));
          }
        }).catch(e => {
          reject(e);
        });
      }).catch(e => {
        throw e;
      });
    }

    /**
     * 将消息设为已读
     * @param from 设置用户id
     * @param target 单聊用户id
     * @param groupId 群聊群id，通过群id是否为空判断是单聊还是群聊
     */
    static readChat(from, target, groupId) {
      let query;
      if (!groupId) {
        let uid1, uid2;
        if (from < target) {
          uid1 = from;
          uid2 = target;
        }
        else {
          uid1 = target;
          uid2 = from;
        }
        query = {uid1: uid1, uid2: uid2, chatFrom: from !== uid1};
      }
      else {
        query = {$or: [{uid1: from, chatFrom: false}, {uid2: from, chatFrom: true}], groupId: groupId};
      }
      return ChatCollection.updateOne(query, {$set: {noRead: 0}});
    }

    /**
     * 设置会话置顶
     * @param chat_id
     * @param topTime
     * @returns {Promise}
     */
    static setTopTime(chat_id, topTime) {
      return ChatCollection.updateOne({_id: ObjectID(chat_id)}, {$set: {topTime: topTime}});
    }

    static msgToChat(msg) {
      let {content, from, target, group, type} = msg;
      let uid1, uid2, chatFrom;
      if (from < target) {
        uid1 = from;
        uid2 = target;
        chatFrom = true;
      }
      else {
        uid1 = target;
        uid2 = from;
        chatFrom = false;
      }
      return {
        uid1: uid1,
        uid2: uid2,
        chatFrom: chatFrom,
        content: content,
        groupId: group,
        type: type
      };
    }

    /**
     * chat转为msg
     * @param chat
     * @param getUid 获取数据的用户ID
     * @returns {{from: *, target: *, group: null, noRead: *, timestamp: *, type: *, content: *}}
     */
    static chatToMsg(chat, getUid) {
      let {uid1, uid2, groupId, chatFrom, noRead, timestamp, type, content, _id, topTime} = chat;
      let from, target;

      if (chatFrom) {
        from = uid1;
        target = uid2;
      }
      else {
        from = uid2;
        target = uid1;
      }

      if (getUid === from) {
        noRead = 0;
      }
      return {
        _id: _id.toHexString(),
        from: from,
        target: target,
        group: !groupId ? null : groupId,
        noRead: noRead,
        chatFrom: chatFrom,
        timestamp: timestamp,
        type: type,
        topTime: topTime,
        content: content,
      };
    }

  };
};