#!/bin/bash
cd `dirname $0`
#export SLACK_TOKEN=
#export SLACK_CHANNEL=
export SLACK_ROBOTNAME=ダンボールロボ
#export ROBOT_REBOOT_COMMAND=
#export ROBOT_ON_COMMAND=
#export ROBOT_OFF_COMMAND=
#export CONFIG_PATH=
#export PORT=5910
node index.js
