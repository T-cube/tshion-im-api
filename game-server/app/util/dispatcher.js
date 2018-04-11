var crc = require('crc');

module.exports.dispatch = function(uid, connectors) {
  if (connectors) {

    var index = Math.abs(crc.crc32(uid)) % connectors.length;
    return connectors[index];
  }
  return null;
};
