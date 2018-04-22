// mysql.js
// Created by fanyingmao 四月/17/2018
// mysql 工具类

let _poolModule = require('generic-pool');

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
  };


  query(sql, args) {
    if (!this._pool) {
      console.error('数据库连接失败');
      return;
    }
    return new Promise((resolve, reject) => {
      this._pool.acquire((err, client) => {
        if (!!err) {
          console.error('[sqlqueryErr] ' + err.stack);
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

  };

  dealItem(key, itme,) {
    let queryItem = [], values = [];
    if (typeof itme === 'object') {
      let valueKeys = Object.keys(itme);
      valueKeys.forEach(key2 => {
        switch (key2) {
          case '$in':
            let arr = itme[key2];
            values.push(...arr);
            queryItem.push(key + ' in (' + arr.map(m => {
              return '?'
            }).join(',') + ')');
            break;
          case '$regex':
            values.push();
            queryItem.push(key + ' regexp ' + itme[key2]);
            break;
        }
      });
    }
    else {
      values.push(itme);
      queryItem.push(key + ' = ?');
    }
    return {queryItem: queryItem.join(' and '), values: values};
  };

  /**
   * 生成sql查询语句
   * @param tableName 表名
   * @param query 相等查询
   * @param fields 字段筛选
   * @param optSql 其它sql语句
   * @returns {*} promise结果返回
   */
  find(tableName, query, fields, optSql) {
    let fieldsKeys;
    if (!fields) {
      fieldsKeys = [];
    }
    else {
      fieldsKeys = Object.keys(fields);
    }
    let fieldSql;
    if (fieldsKeys.length === 0) {
      fieldSql = '*';
    }
    else {
      fieldSql = fieldsKeys.join(',');
    }

    let queryKeys = Object.keys(query);
    let querySql;
    let valueArr = [];//参数统一放入数组，防止sql注入
    if (queryKeys.length === 0) {
      querySql = '';
    }
    else {
      querySql = ' where ';
      let queryArr = [];
      queryKeys.forEach(key => {
        switch (key) {
          case '$or':
            let $orQuery = [];
            query[key].forEach(item => {
              Object.keys(item).forEach(key2 => {
                let {queryItem, values} = this.dealItem(key2, item[key2]);
                valueArr.push(...values);
                $orQuery.push(queryItem);
              });
            });
            queryArr.push('(' + $orQuery.join(' or ') + ')');
            break;
          case '$nor':
            let $norQuery = [];
            query[key].forEach(item => {
              Object.keys(item).forEach(key2 => {
                let {queryItem, values} = this.dealItem(key2, item[key2]);
                valueArr.push(...values);
                $norQuery.push(queryItem);
              });
            });
            queryArr.push('!(' + $norQuery.join(' or ') + ')');
            break;
          default:
            let {queryItem, values} = this.dealItem(key, query[key]);
            valueArr.push(...values);
            queryArr.push(queryItem);
            break;
        }
      });
      querySql += queryArr.join(' and ');
    }
    if (!optSql) {
      optSql = '';
    }
    else {
      optSql = ' ' + optSql;
    }
    let sql = 'select ' + fieldSql + ' from ' + tableName + ' ' + querySql + optSql + ';';
    console.log('sql : ' + sql);
    return this.query(sql, valueArr);
  };

}

module.exports = Mysql;