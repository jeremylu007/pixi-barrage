### 基于PIXI的弹幕组件


#### 效果图
![alt 效果图](//i.niupic.com/images/2021/11/02/9FlW.jpg)


#### 如何使用
```javascript
import PixiBarrage from 'pixi-barrage'

let barrage = new PixiBarrage(...)
```


### 提供的方法

#### constructor([options])
构建函数。

##### options列表:

| 名称 | 类型 | 说明 |
| ---- | ---- | ---- |
| width | number | 弹幕容器宽度，默认为1000 |
| rowCount | number | 显示的行数，默认为3 |
| speed | number | 弹幕的基准速度，默认为1 |
| speedStep | number | 速度递增比例，默认为0.2 |
| giftFormat | string | 礼物类弹幕的描述文字格式。具体请参考下面的说明 |
| showMode | string | realtime: 实时，queue: 队列，默认为realtime |
| space | number | 排队展现时弹幕之间的间隔，默认为30 |
| styleType | string | 样式类型。s1,s2, 默认为s1 |

##### 礼物类弹幕的描述文字格式
礼物类弹幕有`描述文字`, `图片`和`数目`三部分组成，三部分依次排列，构成整个弹幕内容。
每个业务端对于描述文字部分有特定的要求，所以SDK针对描述文字制定了一个规则，供业务端配置使用。
```javascript
// 目前的规则:
// 其中${name}是需要替换的地方，替换为item.user的值
// 其中${giftname}是需要替换的地方，替换为gift.name的值
'自定义的描述信息${giftname}'

// 示例:
let item = {
  user: 'Jeremy',
  gift: {
    name: '玫瑰',
    count: 3,
    url: '/path/to/gift.png'
  }
}
let giftFormat = '${name}: 送给老师${giftname}'
=>
'Jeremy: 送给老师玫瑰'
```

##### 示例
```javascript
let barrage = new PixiBarrage({
  width: 1000,
  rowCount: 5,
  speed: 3,
  speedStep: 0.3,
  giftFormat: '${name}: 送给老师${giftname}',
  showMode: 'queue',
  space: 30,
  styleType: 's1'
})

```


#### push(args)
args形式有两种: `单个弹幕对象`或`弹幕对象数组`

##### 单个弹幕对象的结构
| 名称 | 类型 | 说明 |
| ---- | ---- | ---- |
| user | string | 当前用户 |
| text | string | 文字类弹幕内容 |
| isCurrUser | boolean | 是否是当前用户 |
| emoji | object | 表情类弹幕 |
| emoji.img | string | 表情url |
| gift | object | 礼物类弹幕 |
| gift.name | string | 礼物名称 |
| gift.count | number | 礼物数量 |
| gift.url | string | 礼物图片url |

##### 弹幕对象示例
```javascript
// 文字类弹幕
let textItem = {
  user: 'Tom',
  text: '讲解很赞！',
  isCurrUser: true
}

// 表情类弹幕
let textItem = {
  user: 'Michael',
  emoji: {
    img: '/path/to/emoji.png'
  },
  isCurrUser: true
}

// 送礼物弹幕
let giftItem = {
  user: 'Jeremy',
  gift: {
    name: '玫瑰',
    count: 3,
    url: '/path/to/gift.png',
  }
}
```

##### push方法示例
```javascript
// 逐个添加
barrage.push(textItem)
barrage.push(giftItem)

// 一次性添加
barrage.push([textItem, giftItem])
```


#### start()
启动弹幕。


#### getView()
获取弹幕DOM节点。


#### getCount()
获取当前活跃的弹幕数目。


#### getWaitingCount()
获取当前等待的弹幕数目，主要用于队列式展示。


#### stop()
停止弹幕。


#### clear()
清空弹幕。


#### destroy()
销毁实例。



#### 完整示例请参考 [example](https://github.com/jeremylu007/pixi-barrage/tree/master/example)


### TODO
- [x] 页面切换之后的暂停问题
- [x] 弹幕组件在页面再次返回时的渲染问题
- [ ] 图片跨域的问题
