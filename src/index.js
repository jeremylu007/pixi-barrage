'use strict'

import RealtimeBarrage from './realtime.js'
import QueueBarrage from './queue.js'

class PixiBarrage {
  constructor(options) {
    let showMode = options.showMode || 'realtime'

    if(showMode === 'queue') {
      return new QueueBarrage(options)
    } else if(showMode === 'realtime') {
      return new RealtimeBarrage(options)
    } else {
      throw new Error('not supported `showMode` value')
    }
  }
}

// 添加至全局环境
if(window) window.PixiBarrage = PixiBarrage
export default PixiBarrage
