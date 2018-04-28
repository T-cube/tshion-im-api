'use strict';

const crypto = require('crypto');

module.exports = function(app) {
  const _ = require('../../../libs/util'),
    schema = require('./schema');

  const RoomCollection = app.db.collection('room');

  return class Room {
    constructor(info) {
      _.extend(info, this, schema);
    }

    save() {
      let self = this;

      return RoomCollection.findOneAndUpdate({ roomid: self.roomid }, { $set: self }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(doc => {
        // console.log(121233333344,doc)
        if (doc && doc.value) return doc.value;

        return RoomCollection.insertOne(self).then(result => {
          self._id = result.insertedId;
          return self;
        });
      });
    }

    static createGroupRoomInfo(roomid) {
      return {type, roomid};
    }

    static createRoomInfo() {
      const members = Array.from(arguments);
      const roomid = crypto.createHash('sha1').update(members.join('')).digest('hex');
      return {roomid, members};
    }

    static upgradeActive(room) {
      let { _id } = room;
      return RoomCollection.findOneAndUpdate({ _id }, { $set: { last_active: +new Date, actived: true } }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(doc => doc.value);
    }

    static unActive(roomid) {
      return RoomCollection.findOneAndUpdate({ roomid }, { $set: { actived: false } }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(doc => doc.value);
    }

    static findRoom(query) {
      return RoomCollection.findOne(query);
    }


    /**
     * get user room map
     * @param {String} uid
     * @return {Promise}
     */
    static getUserRoomMap(uid, cid) {
      let query = { members: uid };
      if (cid) {
        query[`room.${uid}`] = cid;
      }
      return RoomCollection.find(query).sort({ last_active: -1 }).toArray().then(docs => docs);
    }
  };
};
