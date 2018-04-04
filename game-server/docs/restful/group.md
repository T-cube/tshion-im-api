# group api

## create group
POST /api/group

param|name|type|des
-----|----|----|---
key|creator|String|group creator _id
key|name|String|group name
key|members|Array|member user_id array

## get user group list
GET /api/group

param|name|type|des
-----|----|----|---
query|user_id|String|user_id

## get group info detail
GET /api/group/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group id string
