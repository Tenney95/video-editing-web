// src/class/VideoTrack.ts

import { uniqueId } from 'lodash-es';
import { videoDecoder, splitClip } from '@/utils/videoediting/webcodecs';
import { OffscreenSprite } from '@webav/av-cliper';
import { UnitFrame2μs } from '@/data/trackConfig';

export class VideoTrack implements VideoEditing.VideoTrackItem {
  id: string;
  type: VideoEditing.TrackType = 'video';
  source: VideoEditing.VideoSource;
  name: string;
  format: string;
  frameCount: number;
  start: number;
  end: any;
  centerX: number;
  centerY: number;
  scale: number;
  height: number;
  width: number;
  offsetL: number;
  offsetR: number;
  audio: HTMLAudioElement | null = null;
  /* 静音 */
  silent: boolean;
  get drawHeight() {
    return this.height * this.scale / 100;
  }
  get drawWidth() {
    return this.width * this.scale / 100;
  }
  constructor(source: VideoEditing.VideoSource, curFrame: number) {
    // 设置ID
    this.id = uniqueId();
    // 设置视频信息
    this.source = source;
    // 获取文件名称
    this.name = source.name;
    // 获取文件类型
    this.format = source.format;
    // 设置轨道信息
    this.frameCount = source.duration * 30;
    this.start = curFrame;
    this.end = this.start + this.frameCount;
    this.silent = false;

    // 设置绘制信息
    this.centerX = 0;
    this.centerY = 0;
    this.scale = 100;
    this.height = source.height;
    this.width = source.width;

    // 设置裁剪信息
    this.offsetL = 0;
    this.offsetR = 0;
  }
  getDrawX(width: number) {
    return width / 2 - this.drawWidth / 2 + this.centerX;
  }
  getDrawY(height: number) {
    return height / 2 - this.drawHeight / 2 + this.centerY;
  }
  /**
   * 渲染需要优化
   * TODO: 不需要没一次都去解码
   * TODO: 优化画布渲染
   */
  draw(ctx: CanvasRenderingContext2D, { width, height }: { width: number, height: number }, frameIndex: number) {
    const frame = Math.max(frameIndex - this.start + this.offsetL, 1); // 默认展示首帧
    return videoDecoder.getFrame(this.source.id, frame).then(async vf => {
      if (vf) {
        ctx.drawImage(vf, 0, 0, this.source.width, this.source.height, this.getDrawX(width), this.getDrawY(height), this.drawWidth, this.drawHeight);
        vf?.close();
      }
    });
  }

  /**
   * 调整元素大小，使其适应指定的宽度和高度
   * 此函数主要用于在保持元素原始宽高比的同时，将元素（如图片或视频）缩放到适合显示的尺寸
   * @param {Object} params - 包含目标宽度和高度的对象
   * @param {number} params.width - 目标宽度
   * @param {number} params.height - 目标高度
   */
  resize({ width, height }: { width: number, height: number }) {
    // 初始化缩放比例为1，即默认不缩放
    let scale = 1;

    // 如果元素的宽度大于目标宽度，则计算宽度方向的缩放比例
    if (this.source.width > width) {
      scale = width / this.source.width;
    }

    // 如果元素的高度大于目标高度，则计算高度方向的缩放比例，并与当前缩放比例取较小值
    if (this.source.height > height) {
      scale = Math.min(scale, height / this.source.height);
    }

    // 根据计算出的缩放比例调整元素的宽度和高度
    this.width = this.source.width * scale;
    this.height = this.source.height * scale;
  }

  /**
 * 播放音频
 * 
 * 如果当前没有音频实例，则根据source.url创建新的音频实例
 * 如果音频处于暂停状态，则根据当前帧计算播放时间，并开始播放
 * 
 * @param currentFrame 当前视频的帧数，用于计算音频播放时间
 */
  play(currentFrame: number) {
    if (this.silent) return
    // 检查是否已经存在音频实例，如果不存在则创建
    if (!this.audio) {
      this.audio = new Audio(this.source.url);
    }

    // 如果音频处于暂停状态，则计算音频的当前播放时间，并播放
    if (this.audio?.paused) {
      this.audio.currentTime = (currentFrame - this.start - this.offsetL) / 30;
      this.audio.play();
    }
  }

  /**
   * 暂停音频播放
   * 此方法检查当前音频对象是否存在且未处于暂停状态，如果条件满足，则暂停音频播放
   */
  pause() {
    // 检查音频对象是否存在且当前未暂停
    if (this.audio && !this.audio.paused) {
      // 暂停音频播放
      this.audio.pause();
    }
  }

  // 生成合成对象
  async combine(playerSize: { width: number, height: number }, outputRatio: number) {
    let video = await videoDecoder.decode({ id: this.source.id });
    // 如何静音哲分离音频
    if (video && this.silent) {
      const [videoClip] = await video.splitTrack();
      video = videoClip;
    }
    const clip = await splitClip(video, { offsetL: this.offsetL, offsetR: this.offsetR, frameCount: this.frameCount });
    if (!clip) {
      throw new Error('clip is not ready');
    }
    const spr = new OffscreenSprite(clip);
    // TODO：需要支持裁剪
    spr.time = { offset: this.start * UnitFrame2μs, duration: (this.end - this.start) * UnitFrame2μs };
    spr.rect.x = this.getDrawX(playerSize.width) * outputRatio;
    spr.rect.y = this.getDrawY(playerSize.height) * outputRatio;
    spr.rect.w = this.drawWidth * outputRatio;
    spr.rect.h = this.drawHeight * outputRatio;

    return spr;
  }

  split(cutFrame: number) {
    this.end = cutFrame;
    this.offsetR = this.frameCount + this.start - cutFrame; // 根据cutFrame对视频进行分割
    // 根据cutFrame对视频进行分割
    const copy = new VideoTrack(this.source, cutFrame);

    copy.offsetL = cutFrame - this.start;
    return copy;
  }
}