# File api

## 上传文件
POST /file

param|name|type|des
-----|----|----|---
key|file|FormData|the upload file

## 上传临时文件（7天有效）
POST /file/temporary

param|name|type|des
-----|----|----|---
key|file|FormData|the upload file

## 获取缩略图
GET /file/image/thumbnail/:image_id

param|name|type|des
-----|----|----|---
param|image_id|String|the image id
query|w|Number|the width of thumbnail
query|h|Number|the height of thumbnail

## 查看原图
GET /file/image/view/:image_id

param|name|type|des
-----|----|----|---
param|image_id|String|the image id

## 下载音频
GET /file/audio/:audio_id

param|name|type|des
-----|----|----|---
param|audio_id|String|the audio id

## 下载文件
GET /file/file/:file_id

param|name|type|des
-----|----|----|---
param|file_id|String|the file id