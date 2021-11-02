import { Graphics } from 'pixi.js/lib/core';

function drawRoundedRect(color, width, height, radius) {
  return new Graphics().beginFill(color, 1).drawCircle(0, height / 2, radius).drawRoundedRect(0, 0, width - radius * 2, height, 1).drawCircle(width - radius * 2, height / 2, radius);
}

export default drawRoundedRect;
//# sourceMappingURL=drawRoundedRect.js.map