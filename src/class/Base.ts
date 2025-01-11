// src/class/Base.ts

export type TrackType = 'video' | 'audio' | 'text' | 'image' | 'effect' | 'transition' | 'filter';

export interface BaseTractItem {
  id: string,
  type: TrackType,
  name: string,
  start: number, // 在轨道上的起始位置，单位为帧
  end: number, // 在轨道上的结束位置
  frameCount: number, // 总帧数
}

export async function getMD5(arrayBuffer: ArrayBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}