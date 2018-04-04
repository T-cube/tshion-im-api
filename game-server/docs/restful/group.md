# group api

## create group
POST /api/group

param|name|type|des
-----|----|----|---
key|creator|String|group creator _id
key|name|String|group name
key|members|Array|member user_id array, max 20 once, max 200 total

## get user group list
GET /api/group

param|name|type|des
-----|----|----|---
query|user_id|String|user _id

## get group info detail
GET /api/group/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string

## get group member list
GET /api/group/members/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string

## get group one member info detail
GET /api/group/member/:member_id

param|name|type|des
-----|----|----|---
param|member_id|type|String|member in group _id

## add group member
PUT /api/group/member/add/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string
key|members|Array|user _id array

## delete group member
DELETE /api/group/member/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string
key|members|Array|user _id array