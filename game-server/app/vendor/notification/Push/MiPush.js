'use strict';

const MiPush = require('../../mipush');
const Push = require('./Push');

const uuidv4 = require('uuid/v4');

const MiPushSender = new MiPush.Sender({
  appSecret: 'bf6pJcMhaLXxLOlYgzosyg=='
});

class MiPushModule extends Push {
  constructor() {
    super();
  }

  sendToRegId(regId, notification) {
    var message = this._message(notification);

    message.notifyId = uuidv4();

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
