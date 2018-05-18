## Chatofpomelo

A simple chat room experiment using pomelo framework and html5.
The chat server currently runs on nodejs v0.8, and should run fine on the latest stable as well.It requires the following npm libraries:
- pomelo
- express
- crc

Both of them can be installed via 'sh npm-install.sh' (it will install a local copy of all the dependencies in the node_modules directory)

## Configuration

 * The server setting (server number, host and port, etc.) can be configured in 'game-server/config/servers.json' and 'game-server/config/master.json' files.
 * Other settings (log4js etc.) also can be configured in 'game-server/config' folder.


## Start
### 配置项
  * 复制start/config文件夹下的所有文件到game-server/config/下
  * 复制start/pem文件夹下的所有文件到 game-server/pem下
### 安装依赖
  * via *npm install* or *yarn*
  * 如果遇到canvas依赖安装错误，请参考github上node-canvas的安装教程
### 启动
  * npm run start
  * 如果遇到env问题，请npm run dev

## Account
* 用户系统数据库是mongodb
* 用户系统公用数据原则：只做查询不做修改
* model在 game-server/app/model/user
* config.js 文件中的 tlf_db 为配置项
* 登陆采用的 rpc 在 game-server/app/servers/tlifang/remote
基本上涉及到用户数据的就这些

## 接口postman测试
(tlf_im)[./game-server/docs/tlf_im api.postman_collection.json]