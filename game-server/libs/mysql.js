// mysql.js
// Created by fanyingmao 四月/17/2018
// mysql 工具类

let _poolModule = require('generic-pool');
let mongodb_sql = require('ym-mogodb-sql');
class Mysql {
  constructor(config) {
    this._pool = this.createMysqlPool(config);
  }

  createMysqlPool(config) {
    return _poolModule.Pool({
      name: config.mysql.database,
      create: function (callback) {
        let mysql = require('mysql');
        let client = mysql.createConnection({
          host: config.mysql.host,
          user: config.mysql.user,
          password: config.mysql.password,
          database: config.mysql.database,
        });
        callback(null, client);
      },
      destroy: function (client) {
        client.end();
      },
      max: 10,
      idleTimeoutMillis: 30000,
      log: false
    });
  }


  query(sql, args) {
    if (!this._pool) {
      console.error('数据库连接失败');
      return;
    }
    return new Promise((resolve, reject) => {
      this._pool.acquire((err, client) => {
        if (err) {
          console.error('[sqlqueryErr] ' + err.stack);
          reject(err);
          return;
        }
        client.query(sql, args, (err, res) => {
          this._pool.release(client);
          if (!err) {
            resolve(res);
          }
          else {
            reject(err);
          }
        });
      });
    });

  }

  dealItem(key, itme) {
    let queryItem = [], values = [];
    if (typeof itme === 'object') {
      let valueKeys = Object.keys(itme);
      valueKeys.forEach(key2 => {
        switch (key2) {
          case '$in':
            let arr = itme[key2];

            if (arr.length === 0) {
              arr.push(Date.now());
            }

            values.push(...arr);
            queryItem.push(key + ' in (' + arr.map(m => {
              return '?';
            }).join(',') + ')');

            break;
          case '$regex':
            values.push(itme[key2]);
            queryItem.push(key + ' regexp ' + '?');
            break;
        }
      });
    }
    else {
      values.push(itme);
      queryItem.push(key + ' = ?');
    }
    return {queryItem: queryItem.join(' and '), values: values};
  }

  /**
   * 生成sql查询语句
   * @param tableName 表名
   * @param query 相等查询
   * @param fields 字段筛选
   * @param optSql 其它sql语句
   * @returns {*} promise结果返回
   */
  find(tableName, query, fields, optSql) {
    let {sql, valueArr} = mongodb_sql.find(tableName, query, fields, optSql);
    return this.query(sql, valueArr);
  }

}

module.exports = Mysql;