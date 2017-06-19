# Deploy
## install dependencies

    yarn
    cd game-server
    yarn

## set apn-key
set pem file in game-server folder

    apn-dev-cert.pem & apn-dev-key.pem work for development env
    apn-cert.pem & apn-key.pem work for production env

## configure nginx
see docs/tim & docs/nginxSSL

## configure config.js
edit game-server/config/config.js

## start

    pm2 start pm2.json