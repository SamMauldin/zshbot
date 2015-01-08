#!/bin/bash

cd /home/ubuntu/zshbot;

while true; do
git pull
npm install
nodejs bot.js
sleep 5
done
