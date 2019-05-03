const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const { RTMClient } = require('@slack/rtm-api');

const token = process.env.SLACK_TOKEN;
const name = process.env.SLACK_ROBOTNAME || os.hostname();
const command = process.env.REBOOT_COMMAND || '/bin/echo';
const PORT = process.env.PORT || 5901;
const conversationId = process.env.SLACK_CHANNEL;

const rtm = new RTMClient(token);
rtm.start()
  .catch(console.error);

rtm.on('ready', async () => {
  console.log('Ready');
  const res = await rtm.sendMessage(`${name}です。起動しました`, conversationId);
  console.log('Message sent: ', res.ts);
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
    if (event.text.indexOf('再起動') >= 0) {
      sendMessage(`再起動します。`, event.channel);
      const playone = spawn(`${command}`);
      playone.stdout.on('data', function(data) {
        process.stdout.write(data.toString());
      });
      playone.on('close', function() {
        console.log('closed');
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
