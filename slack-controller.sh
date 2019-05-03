#!/bin/bash
cd `dirname $0`
#export SLACK_TOKEN=
#export SLACK_CHANNEL=
export SLACK_ROBOTNAME=ダンボールロボ
#export REBOOT_COMMAND=./commands/echo.sh
#export PORT=5910
node index.js
