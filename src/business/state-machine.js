const EventEmitter = require('events');

const STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  SUSPENDED: 'suspended'
};

class StateMachine extends EventEmitter {
  constructor() {
    super();
    this._state = STATES.IDLE;
    this._stateHistory = [];
  }

  getState() {
    return this._state;
  }

  _transition(newState, data = {}) {
    const oldState = this._state;
    
    // Validate transitions
    const validTransitions = {
      [STATES.IDLE]: [STATES.RUNNING],
      [STATES.RUNNING]: [STATES.IDLE, STATES.SUSPENDED],
      [STATES.SUSPENDED]: [STATES.RUNNING, STATES.IDLE]
    };

    if (!validTransitions[oldState]?.includes(newState)) {
      throw new Error(`Geçersiz durum geçişi: ${oldState} → ${newState}`);
    }

    this._state = newState;
    this._stateHistory.push({
      from: oldState,
      to: newState,
      timestamp: Date.now(),
      ...data
    });

    this.emit('stateChange', {
      oldState,
      newState,
      timestamp: Date.now(),
      ...data
    });

    return newState;
  }

  start(taskInfo = {}) {
    return this._transition(STATES.RUNNING, taskInfo);
  }

  stop(data = {}) {
    return this._transition(STATES.IDLE, data);
  }

  suspend(data = {}) {
    return this._transition(STATES.SUSPENDED, data);
  }

  resume(data = {}) {
    return this._transition(STATES.RUNNING, data);
  }

  isIdle() {
    return this._state === STATES.IDLE;
  }

  isRunning() {
    return this._state === STATES.RUNNING;
  }

  isSuspended() {
    return this._state === STATES.SUSPENDED;
  }

  getHistory() {
    return [...this._stateHistory];
  }

  reset() {
    this._state = STATES.IDLE;
    this._stateHistory = [];
  }
}

module.exports = { StateMachine, STATES };
