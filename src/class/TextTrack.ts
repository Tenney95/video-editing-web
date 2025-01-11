import { uniqueId } from 'lodash-es';
import { getTextRect } from '@/utils/common';
import { ImgClip, OffscreenSprite } from '@webav/av-cliper';
import { UnitFrame2μs } from '@/data/trackConfig';


export class TextTrack implements VideoEditing.TextTrackItem {
  id: string;
  name: string;
  frameCount: number;
  start: number;
  end: number;
  format: string;
  source: VideoEditing.TextSource;
  // 文本内容
  fill: string;
  stroke?: string;
  textBackgroundColor?: string;
  // 影响文本绘制的属性都使用getter/setter，在设置时，需要重新计算文本宽高
  _fontSize = 24;
  get fontSize() {
    return this._fontSize;
  }
  set fontSize(value: number) {
    this._fontSize = value;
    // 绘制文本时，需要重新计算文本宽高
    this.calcSize();
  }
  _fontFamily = 'Arial';
  get fontFamily() {
    return this._fontFamily;
  }
  set fontFamily(value: string) {
    this._fontFamily = value;
    // 绘制文本时，需要重新计算文本宽高
    this.calcSize();
  }
  _content = '';
  get content() {
    return this._content;
  }
  set content(value: string) {
    this._content = value;
    // 绘制文本时，需要重新计算文本宽高
    this.calcSize();
  }
  constructor(source: VideoEditing.TextSource, curFrame: number) {
    // 设置ID
    this.id = uniqueId();

    this.source = source;
    // 设置文字信息
    this._content = source.content;
    this.fill = source.fill;
    this.stroke = source.stroke;
    this.textBackgroundColor = source.textBackgroundColor;
    this._fontSize = source.fontSize;
    this._fontFamily = source.fontFamily;
    this.name = source.name;
    // 对于文本意义不大
    this.format = 'text';
    // 设置轨道信息
    this.frameCount = 30 * 60;
    this.start = curFrame;
    this.end = this.start + this.frameCount;
    // 设置绘制信息
    this.centerX = 0;
    this.centerY = 0;
    this.scale = 100;

    this.calcSize();
  }
  calcSize() {
    const { width, height } = getTextRect({ text: this._content, fontSize: this._fontSize, fontFamily: this._fontFamily });
    // 计算文本宽高
    this.height = height;
    this.width = width;
  }
  get drawWidth() {
    return this.width * this.scale / 100;
  }
  get drawHeight() {
    return this.height * this.scale / 100;
  }
  type: VideoEditing.TrackType = 'text';
  centerX = 0;
  centerY = 0;
  scale = 100;
  width = 0;
  height = 0;
  getDrawX(width: number) {
    return width / 2 - this.drawWidth / 2 + this.centerX;
  }
  getDrawY(height: number) {
    return height / 2 - this.drawHeight / 2 + this.centerY;
  }
  drawRoundRect(ctx: OffscreenCanvasRenderingContext2D, { x, y, width, height, radius, color }: { x: number, y: number, width: number, height: number, radius: number, color: string }) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 绘制文本到离屏画布
   * @param ctx 离屏画布的2D渲染上下文
   * @param width 画布宽度
   * @param height 画布高度
   * @param frameIndex 当前帧索引，用于动画效果
   */
  draw(ctx: OffscreenCanvasRenderingContext2D, { width, height }: { width: number, height: number }, frameIndex: number) {
    console.log(frameIndex);
    // 内边距
    const padding = 4;
    // 圆角半径
    const radius = 4;
    // 要绘制的文本内容
    const text = this.content;
    // 计算文本绘制的X轴位置
    const drawL = this.getDrawX(width);
    // 计算文本绘制的Y轴位置
    const drawT = this.getDrawY(height);
    // 根据缩放比例计算字体大小
    const size = this.fontSize * this.scale / 100;
    // 文本填充颜色
    const color = this.fill;
    // 字体家族
    const fontFamily = this.fontFamily;
    // 文本描边颜色
    const strokeColor = this.stroke;
    // 描边宽度
    const strokeWidth = 4;
    // 文本背景颜色
    const backgroundColor = this.textBackgroundColor;

    // 将文本内容按行分割
    const lines = text.split('\n');
    // 计算行高
    const lineHeight = size;

    // 计算所有行中最大文本宽度
    const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));

    // 计算文本区域总高度
    const totalHeight = lines.length * lineHeight;

    // 如果设置了背景颜色，绘制文本背景
    if (backgroundColor) {
      this.drawRoundRect(ctx, {
        x: drawL,
        y: drawT,
        width: textWidth + padding * 2,
        height: totalHeight + padding * 2,
        radius,
        color: backgroundColor
      });
    }

    // 设置文本基线为顶部对齐
    ctx.textBaseline = 'top';
    // 设置字体样式
    ctx.font = `${size}px ${fontFamily}`;

    // 计算文本起始绘制的Y轴位置
    const startY = drawT + (totalHeight - lines.length * size) / 2;

    // 遍历每一行文本进行绘制
    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;

      // 如果设置了描边颜色和描边宽度，先绘制文本描边
      if (strokeColor && strokeWidth) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(line, drawL, y);
      }

      // 设置文本填充颜色并绘制文本
      ctx.fillStyle = color;
      ctx.fillText(line, drawL, y);
    });

    // 返回一个 resolved 的 Promise，表示绘制完成
    return Promise.resolve();
  }

  /**
   * 异步结合图像数据与裁剪功能，生成一个离屏精灵对象
   * 
   * 此函数首先创建一个离屏画布，并在其上绘制图像数据然后，它创建一个图像裁剪对象，
   * 并最终生成一个离屏精灵对象这个精灵对象可以根据给定的播放器尺寸和输出比率进行调整
   * 
   * @param playerSize - 包含播放器宽度和高度的对象，用于计算最终的精灵尺寸
   * @param outputRatio - 输出比率，用于调整最终精灵的尺寸
   * @returns 返回一个配置好的OffscreenSprite对象
   */
  async combine(playerSize: { width: number, height: number }, outputRatio: number) {
    // 创建一个离屏画布，尺寸基于实例的drawWidth和drawHeight属性
    const canvas = new OffscreenCanvas(playerSize.width, playerSize.height);
    // 获取画布的2D渲染上下文
    const ctx = canvas.getContext('2d');
    // 如果上下文获取失败，抛出错误
    if (!ctx) {
      throw new Error('ctx is null');
    }
    // 调用draw方法，在上下文中绘制图像数据
    this.draw(ctx, { width: playerSize.width, height: playerSize.height }, 0);
    // 创建一个图像裁剪对象，基于画布的图像位图
    const clip = new ImgClip(await createImageBitmap(canvas));

    // 等待裁剪对象准备就绪
    await clip.ready;
    // 创建一个离屏精灵对象，使用前面创建的裁剪对象
    const spr = new OffscreenSprite(clip);
    // TODO：需要支持裁剪
    // 配置精灵的时间属性，基于实例的start和frameCount属性
    spr.time = { offset: this.start * UnitFrame2μs, duration: this.frameCount * UnitFrame2μs };
    // 计算并设置精灵的显示位置和尺寸，基于播放器尺寸和输出比率
    spr.rect.x = 0;
    spr.rect.y = 0;
    spr.rect.w = playerSize.width * outputRatio;
    spr.rect.h = playerSize.height * outputRatio;

    // 返回配置好的精灵对象
    return spr;
  }
}