#!/bin/sh
case $1 in
     dev)
       mongo 127.0.0.1:27017/tim_test ./initMongodb.js
       echo "dev mongo init"
     ;;
     pro)
       mongo 192.168.1.18:27017/tim_test ./initMongodb.js
       echo "pro mongo init"
     ;;
     *)
       echo "please input args dev or pro"
     ;;
esac