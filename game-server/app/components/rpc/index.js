'use strict';

const fs = require('fs');

module.exports = function(appid, rpc, app) {
  addEvent(`${__dirname}/${appid}/route`, rpc, app);
};

function addEvents(dir, rpc, app) {
  let files = fs.readdirSync(dir);

  Array.prototype.map.call(files, filename => {
    let filepath = `${dir}/${filename}`;
    if (filename.indexOf('.') < 0) return addEvents(filepath, rpc);

    if (/\.js$/.test(filename)) {
      let events = require(filepath);
      Object.keys(events).map(_path => {
        let routePath = `${dir.replace(/.+\/route\//,'/')}${_path}`;
        rpc.on(routePath, data => {
          events(data, app).then(result => {
            rpc.emit(routePath, { status: 200, data: result });
          }).catch(e => {
            console.error(e);
            rpc.emit(routePath, e);
          });
        });
      });
    }
  });
}
