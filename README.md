# Slack-Controller

Slackのチャンネルにメッセージを送ったり、受け取ってコマンドを実行したりするサンプルプログラムです。

## 実行方法

下記のスクリプトを使って実行します。

```
#!/bin/bash
cd `dirname $0`
export SLACK_TOKEN=[Slack Token]
export SLACK_CHANNEL=[Slack Channel ID]
export SLACK_ROBOTNAME=[ロボット名]
export REBOOT_COMMAND=[再起動コマンドへのパス]
export PORT=[ポート番号]
node index.js
```

## 使い方

以下のメッセージを[Slack Channel ID]のチャンネルに書き込むと、[ロボット名]に対応したロボットが返事をします。

```
[ロボット名]くん、元気？
```

```
[ロボット名]くん、再起動して
```

```
[ロボット名]くん、IPアドレス教えて
```
