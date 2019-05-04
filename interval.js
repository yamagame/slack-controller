const { spawn } = require('child_process');
const EventEmitter = require('events');

const onCommand = process.env.ROBOT_ON_COMMAND || '/bin/echo';
const offCommand = process.env.ROBOT_OFF_COMMAND || '/bin/echo';

function getTime() {
  const t = new Date();
  return `${('00'+t.getHours()).slice(-2)}:${('00'+t.getMinutes()).slice(-2)}`;
}

function execCommand(command, callback) {
  console.log(`${command}`);
  const playone = spawn(`${command}`);
  playone.stdout.on('data', function(data) {
    process.stdout.write(data.toString());
  });
  playone.on('close', function() {
    console.log(`${command} closed`);
    if (callback) callback();
  });
}

function execInterval(onTime = '05:00', offTime = '21:00') {
  let prevTime = getTime()
  const t = {
    event: new EventEmitter(),
    prevTime,
    onTime,
    offTime,
    idle: function() {
      let self = this;
      let t = getTime();
      console.log(t);
      if (t != this.prevTime) {
        this.prevTime = t;
        if (t === this.onTime) {
          execCommand(onCommand, function() {
            self.event.emit('start');
          });
        }
        if (t === this.offTime) {
          execCommand(offCommand, function() {
            self.event.emit('end');
          });
        }
      }
    },
    start: function() {
      this.idle();
      setInterval(() => {
        this.idle();
      }, 30*1000)
    }
  }
  return t;
}

module.exports = execInterval;

if (require.main === module) {
  const t = execInterval('21:40', '21:45');
  t.start();
}
