'use strict';

module.exports = function(app) {
  var drawer = require('../../../vendor/drawer')();
  var File = require('../../../models/file')(app);

  return {
    get: {
      '': {
        method(req, res, next) {
          console.log(app.rpc.test.testRemote);

          app.rpc.test.testRemote.say(null, 'heiheihei', function() {
            res.end(123);
          });
        }
      },
      'avatar': {
        method(req, res, next) {
          // var src = __dirname + '/1.png';
          // var imgs = [src, src, src];
          var imgs = [
            'http://cdn-public-test.tlifang.com/upload/avatar/15980690-f31a-4505-bc7f-83d6d3e5d695.jpg?imageView2/0/w/80/h/80/q/98',
            'http://cdn-public-test.tlifang.com/upload/avatar/8b131836-0b92-4a05-9216-5d4fde1a74e0.jpg?imageView2/0/w/80/h/80/q/98',
           'http://cdn-public-test.tlifang.com/upload/avatar/46d45b97-aa79-4028-83f0-cb0226535a59.jpg?imageView2/0/w/80/h/80/q/98',
           'http://cdn-public-test.tlifang.com/upload/avatar/84e37fd9-f7a9-4bd6-8fe1-1a6c992263ac.jpg?imageView2/0/w/80/h/80/q/98'
          ];

          drawer.puzzle.apply(drawer, imgs)
            .then(result => {
              // res.setHeader('Content-Type', 'image/png');

              File.streamSaveCdn({ stream: result.stream }).then(data => {
                res.json(data);
                drawer.cleartTmp(result.tmpId);
              })

              // result.stream.pipe(res);
            });
        }
      }
    }
  }
}
