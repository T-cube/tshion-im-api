'use strict';
const fs = require('fs');
let apis = new Object();

module.exports = function(exp, app) {
  readRoute(__dirname, app, exp);
  // console.log(apis,'--------:::::::::::::::::::',Object.keys(apis).length);

  const API = [];
  for (let key in apis) {
    API.push(apis[key]);
  }


  exp.get('/apis', (req, res) => {
    res.render('pages/apis', {
      apis: API,
      json: apis,
      // icons: require('config/icons').icons
    });
  });
};


function readRoute(dir, app, exp) {
  let files = fs.readdirSync(dir);

  files.map(filename => {
    let filepath = `${dir}/${filename}`;
    if (filename.indexOf('.') < 0) return readRoute(filepath, app, exp);

    if (/\.r\.js$/.test(filename)) {
      let routes = require(filepath)(app);

      let _apis = {};
      Object.keys(routes).map(method => {
        Object.keys(routes[method]).map(routePath => {
          let __routePath = '/api' + filepath.replace(__dirname, '').replace(filename, '') + routePath;
          console.log(routes[method][routePath]['method']);
          let middleware = routes[method][routePath]['middleware'];
          middleware ?
            exp[method](__routePath,
              Array.isArray(middleware) ? middleware : [middleware],
              routes[method][routePath]['method']
            ) : exp[method](__routePath,
              routes[method][routePath]['method']
            );
          const docs = routes[method][routePath]['docs'];

          if(docs) {

            let api = Object.assign(docs || {}, {
              api_name: docs.name,
              type: method,
              url: __routePath
            });
            Object.assign(_apis, {
              [docs['name']]: api});
          }
        });
      });
      Object.assign(apis, _apis);
    }
  });
};
