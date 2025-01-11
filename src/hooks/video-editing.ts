import { useMessage } from 'naive-ui'
import { getMD5 } from '@/class/Base';
import { ImageTrack } from '@/class/ImageTrack';
import { AudioTrack } from '@/class/AudioTrack';
import { TextTrack } from '@/class/TextTrack';
import { selectFile } from '@/utils/videoediting/file';
import { videoDecoder, imageDecoder, audioDecoder } from '@/utils/videoediting/webcodecs';
import { VideoTrack } from '@/class/VideoTrack';
import { useTrackState } from '@/store/modules/videoediting/trackState';
import { usePlayerState } from '@/store/modules/videoediting/playerState';
import { useResourceStore } from '@/store/modules/videoediting/resourceStore';
import { compressImageBlob, blobToBase64 } from '@/utils/common';

const message = useMessage();

async function saveResources(file: File, videoTrack: VideoTrack | null = null) {
  const resourceStore = useResourceStore();
  let base64Thumbnail = '';
  if (file.type.startsWith('video') && videoTrack) {
    const thumbnails = await videoDecoder.thumbnails(videoTrack.source);
    if (thumbnails && thumbnails[3]) {
      const thumbnailBlob = await compressImageBlob(thumbnails[3].img as Blob, 0.4);
      base64Thumbnail = await blobToBase64(thumbnailBlob);
    }
  } else if (file.type.startsWith('image')) {
    base64Thumbnail = await blobToBase64(file);
  }

  resourceStore.addVideoFile(file, base64Thumbnail);
}

export async function onUpload(file?: File, isSaver = true) {
  const playStore = usePlayerState();
  const trackStore = useTrackState();

  // 需要将获取图片文件转换为ImageTractItem
  // 必须：图片的format、height、width、sourceFrame
  // 非必须：cover信息（如果是gif图片）
  if (!file) {
    const files = await selectFile({ accept: 'image/*,audio/*,video/*', multiple: false });
    if (!files) return;
    file = files[0];
  }

  if (file.type.startsWith('video')) {
    // const start = performance.now();
    // TODO：生成md5时间，已经大于解析视频时间，需要优化
    const id = await getMD5(await file.arrayBuffer());
    // console.log('生成md5耗时', performance.now() - start, 'ms');
    const clip = await videoDecoder.decode({ id, stream: file.stream() });
    // console.log('解析视频耗时', performance.now() - start, 'ms');

    if (!clip) {
      // 提示解析视频失败
      message.error('解析视频失败');
      return;
    }

    const videoTrack = new VideoTrack({
      id,
      url: URL.createObjectURL(file),
      name: file.name,
      format: file.type,
      width: clip.meta.width,
      height: clip.meta.height,
      duration: Math.round(clip.meta.duration / 1e6)
    }, playStore.playStartFrame);

    videoTrack.resize({ width: playStore.playerWidth, height: playStore.playerHeight });

    if (isSaver) await saveResources(file, videoTrack);

    trackStore.addTrack(videoTrack);
    return;
  } else if (file.type.startsWith('image')) {
    const id = await getMD5(await file.arrayBuffer());
    const frames = await imageDecoder.decode({ id, stream: file.stream(), type: file.type });

    if (!frames) return message.error('解析图片失败');

    // 获取文件相关信息
    const imageSource: VideoEditing.ImageSource = {
      id,
      url: URL.createObjectURL(file),
      name: file.name,
      format: file.type,
      width: frames[0].codedWidth,
      height: frames[0].codedHeight
    };
    const imageTrack = new ImageTrack(imageSource, playStore.playStartFrame);

    imageTrack.resize({ width: playStore.playerWidth, height: playStore.playerHeight });

    if (isSaver) await saveResources(file);

    trackStore.addTrack(imageTrack);

    return;

  } else if (file.type.startsWith('audio')) {
    const id = await getMD5(await file.arrayBuffer());

    const clip = await audioDecoder.decode({ id, stream: file.stream(), type: file.type });

    if (!clip) {
      message.error('解析音频失败');
      return;
    }

    const audioTrack = new AudioTrack({
      id,
      url: URL.createObjectURL(file),
      name: file.name,
      format: file.type,
      duration: Math.round(clip.meta.duration / 1e6),
      width: 0,
      height: 0
    }, playStore.playStartFrame);

    if (isSaver) await saveResources(file);
    trackStore.addTrack(audioTrack);
    return;
  }
}

export function addTrackItem(style: { fill: string, stroke?: string, textBackgroundColor?: string }) {
  const trackStore = useTrackState();
  const playStore = usePlayerState();

  trackStore.addTrack(new TextTrack({
    content: '文本内容',
    fontSize: 24,
    fontFamily: 'Arial',
    name: '文本',
    ...style
  }, playStore.playStartFrame));
}


