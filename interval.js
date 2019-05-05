const { spawn } = require('child_process');
const EventEmitter = require('events');

const onCommand = process.env.ROBOT_ON_COMMAND || '/bin/echo';
const offCommand = process.env.ROBOT_OFF_COMMAND || '/bin/echo';
const rebootCommand = process.env.ROBOT_REBOOT_COMMAND || '/bin/echo';

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
    exec: function(command, callback) {
      let self = this;
      if (command === 'start') {
        execCommand(onCommand, function() {
          if (callback) {
            callback();
          } else {
            self.event.emit(command);
          }
        });
      }
      if (command === 'end') {
        execCommand(offCommand, function() {
          if (callback) {
            callback();
          } else {
            self.event.emit(command);
          }
        });
      }
      if (command === 'reboot') {
        execCommand(rebootCommand, function() {
          if (callback) {
            callback();
          } else {
            self.event.emit(command);
          }
        });
      }
    },
    idle: function() {
      let self = this;
      let t = getTime();
      console.log(t);
      if (t != this.prevTime) {
        this.prevTime = t;
        if (t === this.onTime) {
          this.exec('start');
        }
        if (t === this.offTime) {
          this.exec('end');
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
