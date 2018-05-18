// notice.js
// Created by fanyingmao 五月/07/2018
// 群公告
let schema = require('./noticeSchema');

class Notice {
  constructor(app) {
    this.groupNoticeCollection = app.db.collection('chat.group.notice');
    this.ObjectID = app.get('ObjectID');
  }

  insert(notice) {
    let noticeSchema = schema(notice);
    return this.groupNoticeCollection.insertOne(noticeSchema);
  }

  delete(_id) {
    return this.groupNoticeCollection.deleteOne({_id: this.ObjectID(_id)});
  }

  update(_id, setObj) {
    return this.groupNoticeCollection.updateOne({_id: this.ObjectID(_id)}, {$set: setObj});
  }

  findList(groupId, last) {
    if (!last) {
      last = Date.now();
    }
    return this.groupNoticeCollection.find({
      groupId: groupId, timestamp: {
        '$lt': last
      }
    }).sort({timestamp: -1}).limit(20).toArray();
  }

  findOne(_id) {
    return this.groupNoticeCollection.findOne({_id: this.ObjectID(_id)});
  }
}

module.exports = Notice;