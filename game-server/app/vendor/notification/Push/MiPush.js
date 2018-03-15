'use strict';

const MiPush = require('../../mipush');
const Push = require('./Push');

const MiPushSender = new MiPush.Sender({
  appSecret: 'bf6pJcMhaLXxLOlYgzosyg=='
});

class MiPushModule extends Push {
  constructor(){
    super();
  }

  sendToRegId(regId, notification) {
    var message = this._message(notification);
    return new Promise((resolve, reject) => {
      console.log(message,regId)
      MiPushSender.sendToRegId(regId, message, function(err, result) {
        // console.log.apply(null, arguments);
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
