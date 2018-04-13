var crc = require('crc');

module.exports.dispatch = function(uid, connectors) {
  console.log(':::::::::::::;', connectors, uid, Math.abs(crc.crc32(uid)) % connectors.length);
  if (connectors && connectors.length) {

    var index = Math.abs(crc.crc32(uid)) % connectors.length;
    return connectors[index];
  }
  return null;
};
