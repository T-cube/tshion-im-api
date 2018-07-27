var Pomelo = require('../lib/pomelo');

var client = new Pomelo();

client.init({
  host: '192.168.1.115',
  port: 3014
}, () => {
  client.request('pre.gate.gateHandler.queryEntry', {
    token: 'b901efb9259bca8c71de3f738ed975a789aeb0a1',
    uid: '5b28db89c12fcb2623e24fbe'
  }, ({ host, port, init_token }) => {
    client.disconnect();
    client.init({
      host: '192.168.1.115',
      port
    }, () => {
      client.request('pre.connector.entryHandler.enter', { init_token }, result => {
        console.log(result);
      })
    })
  })
});
