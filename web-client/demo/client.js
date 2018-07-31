var Pomelo = require('../lib/pomelo');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var a = {
  token: 'b901efb9259bca8c71de3f738ed975a789aeb0a1',
  uid: '5b28db89c12fcb2623e24fbe',
  host: '192.168.1.115',
  target: '5b28dc31c12fcb2623e24fc3'
}

var b = {
  token: '415aac0b45f144ecf05eef91b56952c10e7022d9',
  uid: '5b28dc31c12fcb2623e24fc3',
  host: '127.0.0.1',
  target: '5b28db89c12fcb2623e24fbe'
}

var user = process.argv[2] == 'a' ? a : b;

var client = new Pomelo();

client.init({
  host: user.host,
  port: 3014
}, () => {
  client.request('pre.gate.gateHandler.queryEntry', {
    token: user.token,
    uid: user.uid
  }, ({ host, port, init_token }) => {
    client.disconnect();
    client.init({
      host: user.host,
      port
    }, () => {
      client.request('pre.connector.entryHandler.enter', { init_token }, result => {
        console.log('enter:', result);
        client.inited();

        rl.on('line', (line) => {
          if (line == 'send') {
            client.request('chat.chatHandler.send', {
              'content': 'Asdasd' + (+new Date),
              'target': user.target,
              'roomid': 'f249055630e2927ee8fd17702b1d330795a58bca',
              'timestamp': +new Date,
              'type': 'text',
            }, (data) => {
              console.log('send message result:', data);
            });
          }
        });
      });
    });
  });
});
