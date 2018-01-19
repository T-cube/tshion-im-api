'use strict';

module.exports = function(app) {
  return {
    get: {
      '': {
        method(req, res, next) {
          console.log(app.rpc.test.testRemote);

          app.rpc.test.testRemote.say(null, 'heiheihei', function() {
            res.end(123);
          });
        }
      }
    }
  }
}
