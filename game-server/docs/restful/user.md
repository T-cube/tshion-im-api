# user api

## 保存设备推送号
POST /user/device-token

param|name|type|des
-----|----|----|---
key|deviceToken|String|device token
key|client|String|device client, 'ios' or 'android'
key|brand|String|device brand, 'xiaomi', 'meizu' and so on
