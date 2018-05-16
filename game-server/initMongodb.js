// initMongodb.js
// Created by fanyingmao 五月/16/2018
// mongodb初始化操作

//添加唯一索引约束成员提高查询效率
db.getCollection('chat.group.member').createIndex({uid: 1}, {unique: true});
db.getCollection('message').createIndex({timestamp: -1});
db.getCollection('message').createIndex({uid1: 1, uid2: 1, system: 1, group: 1, chatType: 1});
db.getCollection('chat').createIndex({timestamp: -1});
db.getCollection('chat').createIndex({uid1: 1, uid2: 1, system: 1, group: 1, chatType: 1}, {unique: true});
db.getCollection('chat.group.member').createIndex({group: 1});
