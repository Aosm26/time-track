const EventEmitter = require('events');
const { powerMonitor } = require('electron');

const DEFAULT_AFK_THRESHOLD = 300; // 5 minutes in seconds

class AfkDetector extends EventEmitter {
  constructor(stateMachine, db) {
    super();
    this._stateMachine = stateMachine;
    this._db = db;
    this._interval = null;
    this._threshold = DEFAULT_AFK_THRESHOLD;
    this._isAfk = false;

    // Load threshold from settings
    try {
      const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
      const row = stmt.get('afkThreshold');
      if (row) {
        this._threshold = JSON.parse(row.value) * 60; // minutes to seconds
      }
    } catch (e) {
      // Use default
    }
  }

  start() {
    this._isAfk = false;
    
    // Check system idle time every second
    this._interval = setInterval(() => {
      this._check();
    }, 1000);
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._isAfk = false;
  }

  setThreshold(seconds) {
    this._threshold = seconds;
  }

  getThreshold() {
    return this._threshold;
  }

  _check() {
    if (!this._stateMachine.isRunning()) return;

    const idleTime = powerMonitor.getSystemIdleTime();

    if (idleTime >= this._threshold && !this._isAfk) {
      this._isAfk = true;

      // Pause the timer via state machine
      this._stateMachine.suspend({ reason: 'afk', idleTime });

      this.emit('afkDetected', {
        idleTime,
        threshold: this._threshold,
        deductionSeconds: this._threshold // Deduct the threshold period
      });
    }
  }

  handleAfkReturn(action) {
    this._isAfk = false;

    if (action === 'continue') {
      // User wants to continue — state will be resumed by timer
    } else if (action === 'stop') {
      // User wants to stop — handled by ipc-handlers
    }
  }
}

module.exports = { AfkDetector, DEFAULT_AFK_THRESHOLD };
