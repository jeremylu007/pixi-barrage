/*
 * 队列式弹幕组件
 *  - 弹幕会顺序展示，并保持固定的间隔
 *  - 量大时展示会有一定的延迟
 */

import RealtimeBarrage from './realtime.js';

class QueueBarrage {
  constructor(options) {
    this.waitingList = [];
    let rowCount = options.rowCount || 3;

    options.onRowOut = row => {
      this.outedMap[row] = true;
      this._dealRowOut(row);
    };

    this.barrage = new RealtimeBarrage(options);

    // 各行统计数据，用于确定下一条弹幕放在哪一行
    let outedMap = {};
    for (let i = 1; i <= rowCount; i++) {
      outedMap[i] = true;
    }
    this.outedMap = outedMap;
  }

  _dealRowOut(row) {
    let next = this.waitingList.shift();
    if (next) {
      this.barrage.push(next, row);
      this.outedMap[row] = false;
    }
  }

  start() {
    this.barrage.start();
  }

  push(args) {
    this.waitingList.push(args);

    let nextRow = this._getNextOutedRow();
    if (nextRow) {
      this._dealRowOut(nextRow);
    }
  }

  _getNextOutedRow() {
    for (let row in this.outedMap) {
      if (this.outedMap[row]) {
        return row;
        break;
      }
    }

    return null;
  }

  getView() {
    return this.barrage.getView();
  }

  getCount() {
    return this.barrage.getCount();
  }

  getWaitingCount() {
    return this.waitingList.length;
  }

  stop() {
    this.barrage.stop();
  }

  clear() {
    this.waitingList = [];
    for (let row in this.outedMap) {
      this.outedMap[row] = true;
    }
    this.barrage.clear();
  }

  isStoped() {
    return this.barrage.isStoped();
  }

  destroy() {
    this.barrage.destroy();
  }
}

export default QueueBarrage;
//# sourceMappingURL=queue.js.map