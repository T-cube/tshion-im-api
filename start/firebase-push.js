var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

var URL = 'https://fcm.googleapis.com/fcm/send';
var PUSH_SERVER_KEY = 'AAAAjLll0BM:APA91bEXXSveOL-s0ufchsW2-yl9o-Qy7Z2w01St1BQKM4ZINUrvlb8ECPZjnCKHZwkh' +
    'Uc6PlMLWZnzZe6paSApzN7YGP3sBB4EGJFXKSnpw0w_BPQXRvIbf9dekpRDACl-KemNYWHGQ5PRuzqQZ' +
    'Nxwni64UY6epiA';
var port = 5555;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text({'defaultCharset': 'utf-8'}));

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `key=${PUSH_SERVER_KEY}`
};

app.post('/api/push-notification', function (req, res, next) {
  var tokens = req.body.tokens || [];
  var data = req.body.data;
  console.log(data);
  Promise.all(tokens.map(token => {
    return new Promise((resolve) => {
      data['to'] = token;
      request.post(URL, {
        headers,
        body: JSON.stringify(data)
      }, function (err, res, body) {
        console.log(body);
        resolve(body);
      });
    });
  })).then(() => {
    res.json({status: 200});
  }).catch((e) => {
    console.error(e);
  });
});

app.listen(port, function () {
  console.log('server start at port:' + port);
});