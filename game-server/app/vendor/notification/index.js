'use strict';
module.exports = function(app) {
  const Account = require('../../models/account')(app);
  const pushNotification = require('./Notification')(app);

  return new Object({
    /**
     *
     * @param {Object} msg
     * @param {String} msg.uid
     */
    createNotification(msg) {
      let { target: uid } = msg;
      msg.uid = uid;
      return Account.getDeviceToken({ uid }).then((tokens = []) => {
        return pushNotification.pushNotification(tokens, msg, false);
      });

    }
  });

};
