const _ = new Object();
let mobile_reg = /^1[34578]\d{9}$/;
let email_reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
module.exports = Object.assign(_, {
  isNumber(number) {
    return !isNaN(number);
  },
  isMobile(mobile) {
    return mobile_reg.test(mobile);
  },
  isEmail(email) {
    return email_reg.test(email);
  },
  /**
   * chek param is blank
   *
   * @param {String} s
   * @return {Boolean}
   */
  isBlank(s) {
    return /^\s+$/.test(s) || !s;
  },
  /**
   * get data type
   * @param {*} data
   * @return {String}
   */
  getType: function(data) {
    return Object.prototype.toString.call(data).replace(/^\[\w+\s|\]$/g, '').toLowerCase();
  },
  // bytes
  b: 1,
  kb: 1 << 10,
  mb: 1 << 20,
  gb: 1 << 30,
  schema: (schema) => {
    let args = arguments;
    delete args[0];
    for (let item in args) {
      if (typeof args[item] != 'object')
        return;
      for (let key in args[item]) {
        if (!(schema[key].type.indexOf(typeof args[item][key]) > -1))
          delete args[item][key];
      }
    }
  },
  filter_deffrent: (data, origin, schema) => {
    let object = {};
    for (let key in schema) {
      if ((typeof data[key] == schema[key].type) && (data[key] != origin[key]))
        object[key] = data[key];
    }
    Object
      .keys(object)
      .length || (object = false);
    return object;
  },
  exclude_repeat(obj, schema) {
    let repeat = {};
    for (let key in schema) {
      if (schema[key].norepeat && obj[key])
        repeat[key] = obj[key];
    }
    if (Object.keys(repeat).length)
      return repeat;
    return null;
  },
  // 排除唯一字段
  excludedEliminate: (obj, col, skip) => {
    if (!obj)
      return Promise.resolve('ok');
    return new Promise((resolve, reject) => {
      let query = {};
      if (skip) {
        let $ne = {};
        for (let key in skip) {
          $ne[key] = {
            $ne: skip[key]
          };
        }
        Object.assign(query, $ne);
      }
      let $or = [];
      for (let key in obj) {
        $or.push({
          [key]: obj[key]
        });
      }
      query['$or'] = $or;
      global
        .mongo
        .find(col, { query: query })
        .then(docs => {
          if (docs.length) {
            docs.forEach(doc => {
              for (let key in obj) {
                if (doc[key] == obj[key]) {
                  reject(global.apiError(400, `${key} has been used`));
                  return;
                }
              }
            });
          }
          resolve('ok');
        })
        .catch(e => {
          reject(e);
        });
    });
  },
  clone: function(schema) {
    let obj = new Object();
    let args = arguments;
    delete args[0];
    for (let key in args) {
      if ((typeof args[key] == 'object') && (args[key].constructor != Array)) {
        for (let skey in args[key]) {
          obj[skey] = args[key][skey];
        }
      }
    }
    _.schema(schema, obj);
    return obj;
  }, // 复制对象参数
  extend: (from, to, schema) => {
    let object = to || new Object();
    let check = schema || from;
    for (let key in check) {
      if ((typeof from[key] == 'object') && !(from[key] instanceof Array)) {
        object[key] = _.extend(from[key], object[key]);
      } else if (schema) {
        if (schema[key]) {
          if ((!from[key]) && schema[key].default) {
            typeof schema[key].default == 'function' ?
              (object[key] = schema[key].default()) :
              (object[key] = schema[key].default);
          } else if (schema[key].type.indexOf(typeof from[key]) > -1) {
            object[key] = from[key];
          }
        }
      } else if (!from[key]) {
        continue;
      } else {
        object[key] = from[key];
      }
    }
    return object;
  },
  // 判断两个数组是否有交集
  a_b: (a, b) => {
    let l,
      s;
    if (a.length > b.length)
      l = a,
      s = b;
    else
      l = b,
      s = a;
    let flag = false;
    for (let i = 0; i < s.length; i++) {
      if (l.has(s[i])) {
        flag = true;
        break;
      }
    }
    return flag;
  },
  // 排除参数
  exclude: (object, array) => {
    array.forEach(key => {
      if (object[key])
        delete object[key];
    });
    return object;
  },
});
