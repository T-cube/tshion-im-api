'use strict';

const schema = require('./schema'),
  _ = require('../../../libs/util');

module.exports = function(app) {
  const accountCollection = app.db.collection('account');

  return class Account {
    constructor(info) {
      console.log(info);
      _.extend(info, this, schema);
    }

    saveAccount() {
      console.log(this);
      return accountCollection.findOneAndUpdate({ uid: this.uid, cid: this.cid }, { $set: this }, { upsert: true }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(result => result.value);
    }

    delDeviceToken({ uid, cid }) {
      return accountCollection.findOneAndUpdate({ uid, cid }, { $set: { deviceToken: '' } });
    }
  };

};