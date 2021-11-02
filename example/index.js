'use strict'

// s1: 样式1 | s2: 样式2 | audioRetell: 语音复述样式
const STYLE_TYPE = 's1'
// 弹幕组件实例
let barrage = null
let adding = true

// 配置项
let configer = {
  rowCount: 3,
  moveSpeed: 2,
  speedStep: 0.2,
  addSpeed: 3,
  space: 30,
  isQueue: true,
  toggleStop() {
    if(barrage) {
      barrage.isStoped() ? barrage.start() : barrage.stop()
    }
  },
  toggleAdd() {
    adding = !adding
  },
  clear() {
    barrage && barrage.clear()
  },

  // 统计类属性
  pushedCount: 0,
  activeCount: 0,
  waitingCount: 0
}

// 监听配置项变化
let changeTimeout = null
let dealChange = () => {
  if(changeTimeout) clearTimeout(changeTimeout)

  changeTimeout = setTimeout(() => {
    initBarrage()
  }, 200)
}

// 构建配置面板
var gui = new window.dat.GUI()
let pushedCountObj = gui.add(configer, 'pushedCount')
let activeCountObj = gui.add(configer, 'activeCount')
let waitingCountObj = gui.add(configer, 'waitingCount')
gui.add(configer, 'rowCount', 1, 15).step(1).onChange(dealChange)
gui.add(configer, 'moveSpeed', 0.1, 10).step(0.1).onChange(dealChange)
gui.add(configer, 'speedStep', 0.1, 1).step(0.1).onChange(dealChange)
gui.add(configer, 'addSpeed', 1, 15).step(0.1).onChange(dealChange)
gui.add(configer, 'space', 1, 50).step(1).onChange(dealChange)
gui.add(configer, 'isQueue').onChange(dealChange)
gui.add(configer, 'toggleStop')
gui.add(configer, 'toggleAdd')
gui.add(configer, 'clear')


// 初始化弹幕实例
let pushInterval = null
initBarrage()
window.addEventListener('resize', dealChange)
// 更新统计数据定时器
setInterval(() => {
  activeCountObj.setValue(barrage.getCount())
  if(configer.isQueue) {
    waitingCountObj.setValue(barrage.getWaitingCount())
  }
}, 1000)


// 初始化弹幕实例
function initBarrage() {
  if(barrage) barrage.destroy()

  barrage = new window.PixiBarrage({
    width: window.innerWidth - 300,
    rowCount: configer.rowCount,
    speed: configer.moveSpeed,
    speedStep: configer.speedStep,
    giftFormat: '${name}: 送给老师',
    showMode: configer.isQueue ? 'queue' : 'realtime',
    space: configer.space,
    styleType: STYLE_TYPE,
  })

  // append view
  let barrageView = barrage.getView()
  let el = document.getElementById('app')
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
  el.appendChild(barrageView)

  // start
  configer.pushedCount = 0
  barrage.start()
  randomAddItem(STYLE_TYPE)
}

// 随机添加弹幕元素
function randomAddItem(styleType) {
  if(pushInterval) clearInterval(pushInterval)

  // audioRetell 数据格式
  let itemList = [
    { user: '鲁新建', text: '我感觉今天的语法很难啊', isCurrUser: true },
    { user: 'Tom', text: '第一句英文解释的意思没弄清楚' },
    { user: '小白', text: '老师声音真好听 ^^' },
    { user: '小森', text: '下次语速可以慢一点吗' },
    { user: '佐佐', text: '这题太难了' },
    { user: 'Linda', gift: { name: '眼镜', count: 3, url: 'https://i.niupic.com/images/2021/11/02/9FlX.png' } },
    { user: 'Tom', gift: { name: '金币', count: 8, url: 'https://i.niupic.com/images/2021/11/02/9Fm0.png' } },
    { user: '鲁新建', gift: { name: '玫瑰', count: 6, url: 'https://i.niupic.com/images/2021/11/02/9FlZ.png' }, isCurrUser: true },
    { user: 'Michael', gift: { name: '辣条', count: 1, url: 'https://i.niupic.com/images/2021/11/02/9FlY.png' } },
    { user: 'Michael', emoji: { img: 'https://i.niupic.com/images/2021/11/02/9FlY.png' } },
  ]

  pushInterval = setInterval(() => {
    if (!adding) return

    let randomIndex = Math.floor(Math.random() * itemList.length)
    let item = copyObj(itemList[randomIndex])

    // 附加时间点，方便检验添加的时间
    // item.user += `(${getCurrTime()})`

    barrage.push(item)
    pushedCountObj.setValue(configer.pushedCount + 1)
  }, 2000/configer.addSpeed)
}

function copyObj(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function getCurrTime () {
  let date = new Date()

  var str =
    ('0' + date.getHours()).slice(-2) + ':' +
    ('0' + date.getMinutes()).slice(-2) + ':' +
    ('0' + date.getSeconds()).slice(-2)

  return str
}
