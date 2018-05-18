#!/usr/bin/env bash
rsync --rsh=ssh -avz ./ root@192.168.1.18:/root/test-im-api
ssh root@192.168.1.18 "pm2 restart tim"
