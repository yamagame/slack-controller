const { spawn } = require('child_process');
const EventEmitter = require('events');

const onCommand = process.env.ROBOT_ON_COMMAND || '/bin/echo';
const offCommand = process.env.ROBOT_OFF_COMMAND || '/bin/echo';
const rebootCommand = process.env.ROBOT_REBOOT_COMMAND || '/bin/echo';
const stateCommand = process.env.ROBOT_STATE_COMMAND || '/bin/echo';

function getTime() {
  const t = new Date();
  return `${('00'+t.getHours()).slice(-2)}:${('00'+t.getMinutes()).slice(-2)}`;
}

function execCommand(command, callback) {
  console.log(`${command}`);
  let result = '';
  let done = false;
  const playone = spawn(`${command}`);
  playone.stdout.on('data', function(data) {
    process.stdout.write(data.toString());
    result += data.toString();
  });
  playone.on('close', function() {
    console.log(`${command} closed`);
    if (!done) {
      if (callback) callback(result);
      done = true;
    }
  });
  playone.on('end', function() {
    console.log(`${command} ended`);
    if (!done) {
      if (callback) callback(result);
      done = true;
    }
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
        execCommand(onCommand, function(result) {
          if (callback) {
            callback(result);
          } else {
            self.event.emit(command, result);
          }
        });
      }
      if (command === 'end') {
        execCommand(offCommand, function(result) {
          if (callback) {
            callback(result);
          } else {
            self.event.emit(command, result);
          }
        });
      }
      if (command === 'reboot') {
        execCommand(rebootCommand, function(result) {
          if (callback) {
            callback(result);
          } else {
            self.event.emit(command, result);
          }
        });
      }
      if (command === 'state') {
        execCommand(stateCommand, function(result) {
          if (callback) {
            callback(result);
          } else {
            self.event.emit(command, result);
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
