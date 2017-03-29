'use strict';
const fs = require('fs');
module.exports = function(exp, app) {
  readRoute(__dirname, app, exp);
};

function readRoute(dir, app, exp) {
  let files = fs.readdirSync(dir);

  files.map(filename => {
    let filepath = `${dir}/${filename}`;
    if (filename.indexOf('.') < 0) return readRoute(filepath, app, exp);

    if (/\.r\.js$/.test(filename)) {
      let routes = require(filepath)(app);

      Object.keys(routes).map(method => {
        Object.keys(routes[method]).map(routePath => {
          let __routePath = '/api' + filepath.replace(__dirname, '').replace(filename, '') + routePath;
          console.log(routes[method][routePath]['method']);
          exp[method](__routePath, routes[method][routePath]['method']);
          console.log(method, '\t', __routePath);
        });
      });
    }
  });
};
