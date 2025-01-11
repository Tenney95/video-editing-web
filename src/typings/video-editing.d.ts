// src/typings/video-editing.d.ts

declare namespace VideoEditing {
  // Define TrackType
  export type TrackType = 'video' | 'audio' | 'text' | 'image' | 'effect' | 'transition' | 'filter';

  export interface ItemLocation {
    left: number;
    right: number;
    start?: number;
    end?: number;
  }

  export interface VideoSource {
    id: string;
    url: string;
    name: string;
    format: string;
    duration: number;
    width: number;
    height: number;
  }

  export interface AudioSource {
    id: string,
    url: string,
    name: string,
    format: string,
    duration: number,
    width?: number,
    height?: number,
  }

  export interface ImageSource {
    id: string,
    url: string,
    name: string,
    format: string,
    width: number,
    height: number
  }

  export interface TextSource {
    content: string,
    fill: string,
    stroke?: string,
    fontSize: number,
    fontFamily: string,
    textBackgroundColor?: string
    name: string
  }

  export type SourceType = VideoSource | AudioSource | ImageSource | TextSource | {
    id: string,
    url: string,
    name: string,
    format: string,
    duration: number
  };

  export interface BaseTrackItem {
    id: string;
    type: TrackType;
    name: string;
    start: number; // 在轨道上的起始位置，单位为帧
    end: number;  // 在轨道上的结束位置
    frameCount: number; // 总帧数
    source: SourceType;
    format: string;
    audio?: any | null
    offsetL?: number; // 左侧偏移量（仅对音视频有效，表示裁剪的帧数）
    offsetR?: number; // 右侧偏移量（仅对音视频有效，表示裁剪的帧数）
    showLeft?: string;
    showWidth?: string;
    time?: string;
    centerX?: number;
    centerY?: number;
    scale: number;
    width: number;
    height: number;
  }

  // Define VideoTrackItem type
  export interface VideoTrackItem extends BaseTrackItem {
    type: TrackType = 'video';
    source: VideoSource;
    silent?: boolean;
    video?: any;
    split: (cutFrame: number) => VideoTrackItem;
    resize: (options: { width: number, height: number }) => void;
    combine: (playerSize: { width: number, height: number }, outputRatio: number) => Promise<any>;
  }

  // Define AudioTrackItem type
  export interface AudioTrackItem extends BaseTrackItem {
    type: TrackType = 'audio';
    source: AudioSource
  }
  // Define ImageTrackItem type
  export interface ImageTrackItem extends BaseTrackItem {
    type: TrackType = 'image';
    source: ImageSource
  }

  export interface TextTrackItem extends BaseTrackItem {
    type: TrackType = 'text';
    source: TextSource
  }

  // Define TrackItem union type
  export type TrackItem = VideoTrackItem | AudioTrackItem | ImageTrackItem | TextTrackItem;


  // Define trackList entry type
  export interface TrackListEntry {
    list: TrackItem[];
    type: TrackType;
    main?: boolean;
  }

  // Define TrackList type
  export type TrackList = TrackListEntry[];

  // Define showTrackList entry type
  export interface ShowTrackListEntry extends Omit<TrackListEntry, 'list'> {
    list: TrackItem[];
  }

  // Define showTrackList type
  export type ShowTrackList = ShowTrackListEntry[];

}