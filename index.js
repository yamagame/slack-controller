const os = require('os');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const { RTMClient } = require('@slack/rtm-api');
const interval = require('./interval');

const token = process.env.SLACK_TOKEN;
const name = process.env.SLACK_ROBOTNAME || os.hostname();
const command = process.env.ROBOT_REBOOT_COMMAND || '/bin/echo';
const PORT = process.env.PORT || 5901;
const conversationId = process.env.SLACK_CHANNEL;

const configPath = process.env.CONFIG_PATH || path.join(__dirname, 'config.json');
let started = false;

function readConfig(configPath) {
  try {
    const text = fs.readFileSync(configPath);
    return JSON.parse(text);
  } catch(err) {
    return {
      onTime: '05:00',
      offTime: '20:00',
    }
  }
}

const config = readConfig(configPath);
console.log(config);
const timer = interval(config.onTime, config.offTime);
timer.event.on('start', () => {
  sendMessage('開始しました。', conversationId);
})
timer.event.on('end', () => {
  sendMessage('終了しました。', conversationId);
})
timer.start();

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config));
}

const rtm = new RTMClient(token);
rtm.start()
  .catch(console.error);

rtm.on('ready', async () => {
  console.log('Ready');
  if (!started) {
    const res = await rtm.sendMessage(`${name}です。起動しました`, conversationId);
    console.log('Message sent: ', res.ts);
    started = true;
  }
});

const sendMessage = async (message, channel) => {
  const res = await rtm.sendMessage(`${name}です。${message}`, channel);
  console.log('Message sent: ', res.ts);
}

rtm.on('message', async (event) => {
  if (event.text.trim().indexOf(name) == 0) {
    if (event.text.indexOf('元気') >= 0) {
      sendMessage(`元気です！`, event.channel);
    } else
    if (event.text.indexOf('開始時間') >= 0) {
      const t = event.text.match(/(\d\d):(\d\d)/);
      if (t) {
        const time = `${t[1]}:${t[2]}`
        timer.onTime = time;
        config.onTime = time;
        saveConfig(config);
        sendMessage(`開始時間を${time}に変更しました`, event.channel);
      } else {
        sendMessage(`何ですか？`, event.channel);
      }
    } else
    if (event.text.indexOf('終了時間') >= 0) {
      const t = event.text.match(/(\d\d):(\d\d)/);
      if (t) {
        const time = `${t[1]}:${t[2]}`
        timer.offTime = time;
        config.offTime = time;
        saveConfig(config);
        sendMessage(`終了時間を${time}に変更しました`, event.channel);
      } else {
        sendMessage(`何ですか？`, event.channel);
      }
    } else
    if (event.text.indexOf('設定') >= 0) {
        sendMessage(`開始時間は${timer.onTime}、終了時間は${timer.offTime}です。`, event.channel);
    } else
    if (event.text.indexOf('再起動') >= 0) {
      sendMessage(`再起動します。`, event.channel);
      const playone = spawn(`${command}`);
      playone.stdout.on('data', function(data) {
        process.stdout.write(data.toString());
      });
      playone.on('close', function() {
        console.log(`${command} closed`);
      });
    } else
    if (event.text.indexOf('IPアドレス') >= 0) {
      function getIPAddress() {
        var interfaces = os.networkInterfaces();
        for (var devName in interfaces) {
          var iface = interfaces[devName];

          for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
              return alias.address;
          }
        }
        return '0.0.0.0';
      }
      sendMessage(`${getIPAddress()}です。`, event.channel);
    } else {
      sendMessage(`何ですか？`, event.channel);
    }
  }
});

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ type: 'application/json' }))

app.post('/message', (req, res) => {
  sendMessage(req.body.text, conversationId);
  res.send('OK\n');
})

const server = require('http').Server(app);
server.listen(PORT, () => console.log(`slack-controller listening on port ${PORT}!`))
