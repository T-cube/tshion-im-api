'use strict';

const MiPush = require('../../mipush');
const Push = require('./Push');

const MiPushSender = new MiPush.Sender(require('../../../../config/config').mipush);

class MiPushModule extends Push {
  constructor() {
    super();
  }

  _createMessage(notification) {
    var message = new MiPush.Message();
    var { alert, title, extras = {} } = notification;
    message.title = title;
    message.description = alert;
    message.restricted_package_nameApp = 'com.tlfapp';
    message.pass_through = 0;
    message.notify_type = -1;
    message.notify_id = +(+new Date + '').substr(4);
    message.payload = alert;

    for (var key in extras) {
      message.extra(key, extras[key]);
    }

    return message;
  }

  sendToRegId(regId, notification) {
    var message = this._createMessage(notification);

    return new Promise((resolve, reject) => {
      MiPushSender.sendToRegId(regId, message, function(err, result) {
        console.log.apply(null, arguments);
        if (err) return reject(err);

        resolve(result);
      });
    });
  }
}

var push = null;

/**
 * @returns {MiPushModule}
 */
module.exports = function() {
  if (!push) push = new MiPushModule();
  return push;
};
