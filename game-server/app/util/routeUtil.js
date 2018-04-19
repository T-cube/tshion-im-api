var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function(session, msg, app, cb) {
  var chatServers = app.getServersByType('chat');

  if (!chatServers || chatServers.length === 0) {
    cb(new Error('can not find chat servers.'));
    return;
  }
  console.log(session.get('cid'),msg,'::::::::::::');
  var res = dispatcher.dispatch(session.get('cid'), chatServers);

  cb(null, res.id);
};
