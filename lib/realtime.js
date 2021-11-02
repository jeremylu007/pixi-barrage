/*
 * 实时弹幕组件
 *  - 新增加的弹幕会立即进行展示
 *  - 量大时会有重叠
 */

import { Application, Container, Text, Texture, Sprite, Graphics, ticker as pixiTicker } from 'pixi.js/lib/core';

class RealtimeBarrage {
  constructor(options) {
    options = options || {};

    let rowHeight;

    // 判断样式类型
    let styleType = options.styleType || 's1';
    switch (styleType) {
      case 's1':
        rowHeight = 35;
        break;
      case 's2':
        rowHeight = 60;
        break;
      default:
        rowHeight = 35;
    }

    // 读取参数
    let width = options.width || 1000;
    let rowCount = options.rowCount || 3;
    let height = rowCount * rowHeight;
    this.width = width;
    this.rowHeight = rowHeight;
    this.speed = options.speed || 1;
    this.speedStep = options.speedStep || 0.2;
    this.giftFormat = options.giftFormat || '${name}: 送出${giftname}';
    this.onRowOut = options.onRowOut || function () {};
    this.space = options.space || 30;
    this.styleType = styleType;

    // 各行统计数据，用于确定下一条弹幕放在哪一行
    let rowCountMap = {};
    for (let i = 1; i <= rowCount; i++) {
      rowCountMap[i] = 0;
    }
    this.rowCountMap = rowCountMap;

    // 构建PIXI App实例
    let app = new Application(width, height, { transparent: true, antialias: true });
    this.app = app;
    this.container = app.stage;
    this.aliveCheckTime = 0;

    // 初始化计时器
    this._initTicker();

    //初始化备用计时器（页面失焦时使用
    this._initSubTicker();
  }

  start() {
    if (!this.ticker.started) {
      this.stoped = false;
      this.ticker.start();
    }
  }

  push(args, row) {
    if (!(args instanceof Array)) {
      args = [args];
    }

    // 处理新加入的弹幕
    args.forEach(item => {
      row = row || this._getNextRow();
      let sprite = this._getSprite1(item);

      // 设置属性
      sprite.row = row;
      sprite.speed = this.speed * (1 + row * this.speedStep);
      sprite.x = this.width;
      sprite.y = (row - 1) * this.rowHeight + 5;

      this.container.addChild(sprite);
      this.rowCountMap[row] += 1;
    });
  }

  getView() {
    return this.app.view;
  }

  getCount() {
    return this.container.children.length;
  }

  stop() {
    this.ticker.stop();
    this.subTicker.stop();
    this.stoped = true;
  }

  clear() {
    this.container.removeChildren();
    for (let row in this.rowCountMap) {
      this.rowCountMap[row] = 0;
    }
  }

  isStoped() {
    return this.stoped;
  }

  destroy() {
    this.stop();
    this.clear();
    this.app.destroy();
    this.subTicker.destroy();
    this.ticker = null;
    this.subTicker = null;
  }

  _getStyle(type, options) {
    options = options || {};

    let style = {
      fontSize: 18
    };

    if (options.shadow) {
      // TODO 优化shadow，以保持和UI设计一致
      Object.assign(style, {
        dropShadow: true,
        dropShadowAlpha: 3,
        dropShadowAngle: 1,
        dropShadowBlur: 2,
        dropShadowDistance: 0,
        dropShadowColor: '#000000'
      });
    }

    if (type === 'orange') {
      style.fill = '#ff9000';
    }
    if (type === 'white') {
      style.fill = '#ffffff';
    }
    if (type === 'yellow') {
      style.fill = '#FFE700';
    }

    return style;
  }

  // 获取下一个最适合放置的行
  _getNextRow() {
    let nextRow = 1;
    let minCount = this.rowCountMap[nextRow];

    for (let row in this.rowCountMap) {
      let currCount = this.rowCountMap[row];
      if (currCount < minCount) {
        minCount = currCount;
        nextRow = row;
      }
    }

    return nextRow;
  }

  _getSprite1(item) {
    let styles;

    // 将名字强制设置为'我'
    if (item.isCurrUser) {
      item.user = '我';
    }

    if (this.styleType === 's1') {
      // 当前用户使用高亮样式模板
      if (item.isCurrUser) {
        styles = {
          preText: this._getStyle('orange', { shadow: true }),
          afterText: this._getStyle('orange', { shadow: true })
        };
      } else {
        styles = {
          preText: this._getStyle('white', { shadow: true }),
          afterText: this._getStyle('white', { shadow: true })
        };
      }

      styles.preText.fontSize = 18;

      Object.assign(styles.afterText, {
        fontSize: 20,
        fontStyle: 'italic',
        letterSpacing: 3
      });
    } else if (this.styleType === 's2') {
      styles = {
        preText: this._getStyle('white'),
        afterText: this._getStyle('yellow')
      };

      styles.preText.fontSize = 24;

      Object.assign(styles.afterText, {
        fontSize: 24,
        letterSpacing: 3,
        fontWeight: 600
      });
    }

    if (this.styleType === 's1') {
      return this._getSprite(item, styles);
    } else if (this.styleType === 's2') {
      let sprite = this._getSprite(item, styles);
      let paddingTop = 10;
      let paddingLeft = 24;
      let color = item.isCurrUser ? 0x544ab0 : 0x303030;

      let backgroundSprite = new Graphics().beginFill(color, 0.3).drawRoundedRect(0, 0, sprite.width + paddingLeft * 2, 23 + paddingTop * 2, 21);
      sprite.x = paddingLeft;
      sprite.y = paddingTop - 3;
      backgroundSprite.addChild(sprite);

      return backgroundSprite;
    }
  }

  // 构建一条弹幕的Sprite实例
  _getSprite(item, styles) {
    let sprite = new Container();

    // 礼物类弹幕
    if (item.gift) {
      // 发送人部分
      let preText = this.giftFormat.replace('${name}', item.user);
      preText = preText.replace('${giftname}', item.gift.name);

      let preTextSprite = new Text(preText, styles.preText);

      // 礼物图片部分
      let imgSprite = new Sprite(new Texture.fromImage(item.gift.url));
      imgSprite.x = preTextSprite.width + 3;
      imgSprite.y = -8;
      imgSprite.height = 40;
      imgSprite.width = 40;

      // 礼物数量描述部分
      let afterTextSprite = new Text(`x${item.gift.count}`, styles.afterText);
      afterTextSprite.x = imgSprite.x + imgSprite.width + 3;

      // 组合各个部分
      sprite.addChild(preTextSprite);
      sprite.addChild(imgSprite);
      sprite.addChild(afterTextSprite);
    } else if (item.emoji) {
      // 表情类弹幕

      // 发送人部分
      let preTextSprite = new Text(`${item.user}：`, styles.preText);

      // 表情图片部分
      let imgSprite = new Sprite(new Texture.fromImage(item.emoji.img));
      imgSprite.x = preTextSprite.width + 3;
      imgSprite.y = -8;
      imgSprite.height = 40;
      imgSprite.width = 40;

      // 组合各个部分
      sprite.addChild(preTextSprite);
      sprite.addChild(imgSprite);
    } else {
      // 文字类弹幕
      let textSprite = new Text(`${item.user}：${item.text}`, styles.preText);
      sprite.addChild(textSprite);
    }

    return sprite;
  }

  // 初始化计时器
  _initTicker() {
    let ticker = new pixiTicker.Ticker();
    ticker.autoStart = false;
    ticker.stop();
    ticker.add(() => {
      this._refreshAlive();

      this._refresh(1);
    });

    this.ticker = ticker;
  }

  // 更新pixiTicker的alive状态(心跳)
  _refreshAlive() {
    // 定量抽查
    // 即每触发60次refresh，才会真正执行一次检查逻辑
    this.aliveCheckTime += 1;
    if (this.aliveCheckTime < 60) return;

    // console.log('复活检测...')
    this.aliveCheckTime = 0;
    // 处理复活逻辑
    if (!this.alive) {
      // console.log('已复活')
      this.subTicker.stop();
    }
    this.alive = true;

    if (this.aliveTimeout) {
      clearTimeout(this.aliveTimeout);
      this.aliveTimeout = null;
    }
    // 3秒无活动，判定为不活跃状态
    this.aliveTimeout = setTimeout(() => {
      if (!this.stoped) {
        // console.log('dead~')
        this.subTicker.start();
        this.alive = false;
      }
    }, 3000);
  }

  //初始化备用计时器(页面失焦时使用)
  _initSubTicker() {
    var subTicker = new SubTicker(() => {
      this._refresh(60);
    });
    subTicker.stop();

    this.subTicker = subTicker;
  }

  _refresh(speedTimes) {
    let outedList = [];
    // 遍历容器中所有的弹幕Sprite
    this.container.children.forEach(sprite => {
      // 移动其x坐标
      sprite.x -= sprite.speed * speedTimes;

      // 判断是否已出界
      if (sprite.x + sprite.width < 0) {
        outedList.push(sprite);
      }

      // 判断内容是否已全部露出，用于队列式的追加
      if (!sprite.rowOuted && sprite.x + sprite.width + this.space < this.width) {
        sprite.rowOuted = true;
        this.onRowOut(sprite.row);
      }
    });

    // 销毁已经出界的弹幕
    outedList.forEach(sprite => {
      this.container.removeChild(sprite);
      this.rowCountMap[sprite.row] -= 1;
      sprite.destroy();
    });
  }
}

// 备用Ticker，在pixiTicker失效时进行工作，确保ticker正常进行
// pixiTicker失效一般是浏览器页面退到系统后台的时候
class SubTicker {
  constructor(fn) {
    this.running = false;
    this.logicFn = fn;

    this.interval = setInterval(() => {
      if (!this.running) return;

      fn();
    }, 1000);
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  destroy() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }
  }
}

export default RealtimeBarrage;
//# sourceMappingURL=realtime.js.map