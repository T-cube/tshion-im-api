# friend api

## 模糊搜索用户
GET /user

param|name|type|des
-----|----|----|---
query|name|String|optional
query|keyword|String|optional
query|mobile|String|optional
query|user|type|String|not null,search user id

## 获取某个用户数据详情
GET /user/:user_id

param|name|type|des
-----|----|----|---
param|user_id|String|target user id

## 发送添加好友请求
POST /user/friend-request

param|name|type|des
-----|----|----|---
key|user_id|String|target user id
key|from|String|send request user id
key|mark|String|optional, 备注

## 拉取好友请求列表
GET /user/friend-request/receiver/:receiver

param|name|type|des
-----|----|----|---
param|receiver|String|receive friend request user id

## 操作好友请求
POST /user/friend-request/:status

param|name|type|des
-----|----|----|---
key|request_id|String|not null, request id
param|status|Enum|['reject','agree']

## 获取好友列表
GET /user/friends/:user_id

param|name|type|des
-----|----|----|---
param|user_id|String|user id

## 获取某个好友的信息
GET /user/friends/info/:user_id

param|name|type|des
-----|----|----|---
param|user_id|String|target user id

## 获取好友某个分组的信息
GET /user/friends/:user_id/:group_id

param|name|type|des
-----|----|----|---
param|user_id|String|user id
param|group_id|String|friend group id

## 创建好友分组

## 获取好友分组列表