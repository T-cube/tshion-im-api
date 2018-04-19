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
            console.error("数据库连接失败");
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

    strChang(obj) {
        if (typeof obj === 'string') {
            return "'" + obj + "'"
        }
        else {
            return obj;
        }
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
            fieldSql = "*";
        }
        else {
            fieldSql = fieldsKeys.join(",");
        }

        let queryKeys = Object.keys(query);
        let querySql;

        if (queryKeys.length === 0) {
            querySql = "";
        }
        else {
            querySql = " where ";
            let queryArr = [];
            queryKeys.forEach(key => {
                let value = query[key];
                switch (typeof value) {
                    case 'object':
                        let valueKeys = Object.keys(value);
                        valueKeys.forEach(key2 => {
                            switch (key2) {
                                case '$in':
                                    let arr = value[key2];
                                    arr.forEach(index => {
                                        if (typeof arr[index] === 'string') {
                                            arr[index] = this.strChang(arr[index]);
                                        }
                                    });
                                    queryArr.push(key + " in (" + arr.join(",") + ")");
                                    break;
                            }
                        });
                        break;
                    default:
                        value = this.strChang(value);
                        queryArr.push(key + " = " + value);
                        break;
                }
            });
            querySql += queryArr.join(" and ");
        }
        if (!optSql) {
            optSql = "";
        }
        else {
            optSql = " " + optSql;
        }
        let sql = "select " + fieldSql + " from " + tableName + " " + querySql + optSql + ";";
        console.log("sql : " + sql);
        return this.query(sql, []);
    };

}

module.exports = Mysql;