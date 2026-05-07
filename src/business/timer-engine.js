const EventEmitter = require('events');

class TimerEngine extends EventEmitter {
  constructor(stateMachine) {
    super();
    this._stateMachine = stateMachine;
    this._interval = null;
    this._startTime = null;
    this._elapsedBeforePause = 0;
    this._afkDeductionSeconds = 0;
    this._currentLogId = null;
    this._currentTask = null;
    this._paused = false;
  }

  start(logId, taskInfo) {
    if (this._interval) {
      this.stop();
    }

    this._currentLogId = logId;
    this._currentTask = taskInfo;
    this._startTime = Date.now();
    this._elapsedBeforePause = 0;
    this._afkDeductionSeconds = 0;
    this._paused = false;

    this._stateMachine.start(taskInfo);

    this._interval = setInterval(() => {
      if (!this._paused) {
        this._tick();
      }
    }, 1000);

    this._tick(); // Immediate first tick
  }

  stop() {
    const result = {
      logId: this._currentLogId,
      elapsedSeconds: this.getElapsed(),
      afkSeconds: this._afkDeductionSeconds,
      task: this._currentTask
    };

    clearInterval(this._interval);
    this._interval = null;

    if (this._stateMachine.isRunning() || this._stateMachine.isSuspended()) {
      this._stateMachine.stop();
    }

    this._currentLogId = null;
    this._currentTask = null;
    this._startTime = null;
    this._elapsedBeforePause = 0;
    this._afkDeductionSeconds = 0;
    this._paused = false;

    return result;
  }

  pause() {
    if (!this._paused && this._startTime) {
      this._elapsedBeforePause += Math.floor((Date.now() - this._startTime) / 1000);
      this._startTime = null;
      this._paused = true;
    }
  }

  resume() {
    if (this._paused) {
      this._startTime = Date.now();
      this._paused = false;

      if (this._stateMachine.isSuspended()) {
        this._stateMachine.resume();
      }
    }
  }

  deductAfkTime(seconds) {
    this._afkDeductionSeconds += seconds;
  }

  getElapsed() {
    let total = this._elapsedBeforePause;
    if (this._startTime && !this._paused) {
      total += Math.floor((Date.now() - this._startTime) / 1000);
    }
    return Math.max(0, total - this._afkDeductionSeconds);
  }

  getRawElapsed() {
    let total = this._elapsedBeforePause;
    if (this._startTime && !this._paused) {
      total += Math.floor((Date.now() - this._startTime) / 1000);
    }
    return total;
  }

  getCurrentTask() {
    return this._currentTask;
  }

  isRunning() {
    return this._interval !== null && !this._paused;
  }

  isPaused() {
    return this._paused;
  }

  _tick() {
    const elapsed = this.getElapsed();
    
    this.emit('tick', {
      logId: this._currentLogId,
      elapsedSeconds: elapsed,
      afkSeconds: this._afkDeductionSeconds,
      taskId: this._currentTask?.taskId,
      taskName: this._currentTask?.taskName,
      projectId: this._currentTask?.projectId,
      projectName: this._currentTask?.projectName,
      state: this._stateMachine.getState()
    });
  }
}

module.exports = { TimerEngine };
