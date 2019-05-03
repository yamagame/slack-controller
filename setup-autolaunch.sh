#!/bin/sh
cd ~

cd slack-controller
sudo mv slack-controller.service /lib/systemd/system/
sudo systemctl enable slack-controller.service
