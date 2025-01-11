import { uniqueId } from 'lodash-es';
import { UnitFrame2μs } from '@/data/trackConfig';
import { audioDecoder, splitClip } from '@/utils/videoediting/webcodecs';
import { OffscreenSprite } from '@webav/av-cliper';

export class AudioTrack implements VideoEditing.BaseTrackItem {
  id: string;
  type: VideoEditing.TrackType = 'audio';
  source: VideoEditing.AudioSource;
  name: string;
  format: string;
  frameCount: number;
  start: number;
  end: number;
  offsetL: number;
  offsetR: number;
  /* scale、width、height用来类型占位使用，逻辑中无用 */
  scale: number;
  width: number;
  height: number;
  constructor(source: VideoEditing.AudioSource, curFrame: number) {
    // 设置ID
    this.id = uniqueId();
    // 设置音频信息
    this.source = source;
    // 获取文件名称
    this.name = source.name;
    // 获取文件类型
    this.format = source.format;

    // 获取音频时长，转换为frameCount
    this.frameCount = source.duration * 30;
    this.start = curFrame;
    this.end = this.start + this.frameCount;

    // 设置裁剪信息
    this.offsetL = 0;
    this.offsetR = 0;

    this.scale = 0;
    this.width = 0;
    this.height = 0;
  }
  audio: HTMLAudioElement | null = null;
  play(currentFrame: number) {
    if (!this.audio) {
      this.audio = new Audio(this.source.url);
    }
    if (this.audio?.paused) {
      this.audio.currentTime = (currentFrame - this.start - this.offsetL) / 30;
      this.audio.play();
    }
  }
  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }
  // 生成合成对象
  async combine() {
    const audio = await audioDecoder.decode({ id: this.source.id });
    const clip = await splitClip(audio, { offsetL: this.offsetL, offsetR: this.offsetR, frameCount: this.frameCount });
    if (!clip) {
      throw new Error('clip is not ready');
    }
    const spr = new OffscreenSprite(clip);
    // TODO：需要支持裁剪
    spr.time = { offset: this.start * UnitFrame2μs, duration: (this.end - this.start) * UnitFrame2μs };

    return spr;
  }
}