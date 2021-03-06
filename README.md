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
export ROBOT_REBOOT_COMMAND=[再起動コマンドへのパス]
export ROBOT_ON_COMMAND=[開始コマンドへのパス]
export ROBOT_OFF_COMMAND=[終了コマンドへのパス]
export ROBOT_STATE_COMMAND=[状態確認コマンドへのパス]
export ROBOT_UPDATE_COMMAND=[更新コマンドへのパス]
export CONFIG_PATH=[設定ファイルへのパス]
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

```
[ロボット名]くん、今何時？
```

```
[ロボット名]くん、開始時間を08:00にして
```

```
[ロボット名]くん、終了時間を19:00にして
```

```
[ロボット名]くん、開始して
```

```
[ロボット名]くん、終了して
```

```
[ロボット名]くん、設定教えて
```

```
[ロボット名]くん、状態教えて
```

## プロセスの稼働確認スクリプトサンプル

```bash
#!/bin/bash
PROCESS_NAME='node servo-head.js'
count=`ps -ef | grep "$PROCESS_NAME" | grep -v grep | wc -l`
if [ $count = 0 ]; then
  echo 停止中
else
  echo 稼働中
fi
```
