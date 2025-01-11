import { baseFps } from "@/data/trackConfig";
import { MP4Clip, AudioClip } from "@webav/av-cliper";
import { decodeImg } from "@/utils/common"
import { file, write } from "opfs-tools";
import { UnitFrame2μs } from '@/data/trackConfig';

async function writeFile(id: string, stream?: ReadableStream<Uint8Array>) {
  if (!stream) {
    // 没有数据流，尝试从opfs中获取
    stream = await file(id).stream();

    if (!stream) {
      throw new Error("stream is not ready");
    }
  }

  const start = performance.now()

  // 如果opfs中没有数据则存储
  if (!(await file(id).exists())) {
    await write(id, stream);
    console.log('opfs存储文件耗时', performance.now() - start, 'ms');

    stream = await file(id).stream();

    console.log('opfs读取文件耗时', performance.now() - start, 'ms');
  }

  return stream;
}

class VideoDecoder {
  #decoderMap = new Map<string, MP4Clip>();

  #thumbnailsMap = new Map<string, {
    img: Blob;
    ts: number;
  }[]>();

  /**
   * 异步解码函数
   * 
   * 该函数根据提供的ID、流和类型来解码内容如果已缓存了解码器，则直接返回
   * 否则，它将尝试通过写入文件来准备流，然后创建一个新的MP4Clip实例，
   * 并在准备好后返回该实例
   * 
   * @param {Object} params - 包含id、stream和type的对象
   * @param {string} params.id - 要解码的内容的唯一标识符
   * @param {ReadableStream<Uint8Array>?} params.stream - 可选的读取流，包含要解码的数据
   * @param {string?} params.type - 可选的类型，可能用于指定解码的类型
   * @returns {Promise<MP4Clip>} 返回一个Promise，解析为MP4Clip实例
   */
  async decode({ id, stream }: { id: string, stream?: ReadableStream<Uint8Array> }) {
    // 检查解码器缓存中是否已有该ID的解码器
    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id);
    }

    // 将流写入文件，并在写入完成后更新stream变量
    stream = await writeFile(id, stream);

    // 如果流未准备好，则抛出错误
    if (!stream) {
      throw new Error("stream is not ready");
    }

    // 创建一个新的MP4Clip实例
    const videoClip = new MP4Clip(stream);

    // 等待直到videoClip实例准备好
    await videoClip.ready;

    // 将准备好的videoClip实例缓存起来
    this.#decoderMap.set(id, videoClip);

    // 返回准备好的videoClip实例
    return videoClip;
  }

  /**
 * 异步获取视频缩略图
 * 
 * 本函数用于从给定的视频源中提取一定数量的缩略图如果已经为该视频源生成了缩略图，
 * 则直接返回缓存的缩略图否则，首先解码视频，然后生成缩略图，并将它们缓存起来以供后续使用
 * 
 * @param source 视频源，包含视频的唯一标识符
 * @returns Promise，解析为生成的或缓存的缩略图
 * @throws 如果视频解码失败或视频源不可用，则抛出错误
 */
  async thumbnails(source: VideoEditing.VideoSource) {
    // 检查是否已经为该视频源生成了缩略图
    if (this.#thumbnailsMap.has(source.id)) {
      return this.#thumbnailsMap.get(source.id);
    }

    // 解码视频源
    const clip = await this.decode({ id: source.id });

    // 确保视频已成功解码
    if (!clip) {
      throw new Error("clip is not ready");
    }

    // 生成缩略图，最多50张，每隔1微秒提取一帧
    const thumbnails = await clip.thumbnails(50, { step: 1e6 });

    // 将生成的缩略图缓存起来
    this.#thumbnailsMap.set(source.id, thumbnails);

    // 返回生成的缩略图
    return thumbnails;
  }


  /**
   * 异步获取指定视频的某一帧画面
   * 
   * 本函数通过视频ID和帧索引从已解码的视频片段中获取相应的画面帧如果视频片段尚未解码，
   * 则先进行解码操作然后根据帧索引计算出时间点，并获取该时间点的画面帧如果计算出的时间点
   * 小于最小时间（5/30秒），则调整为最小时间本函数返回获取到的画面帧
   * 
   * @param id 视频的唯一标识符，用于识别特定的视频资源
   * @param frameIndex 帧索引，表示需要获取的画面在视频中的序列位置
   * @returns 返回Promise，解析为指定帧的画面数据
   */
  async getFrame(id: string, frameIndex: number) {
    // 尝试从解码器映射中获取指定ID的视频片段
    let clip = this.#decoderMap.get(id);
    // 如果未找到对应的视频片段，则进行解码操作
    if (!clip) clip = await this.decode({ id })
    // tick根据时间获取帧，可能存在这一时间帧为空的情况，修改为在范围内寻找帧
    // 前几帧可能为空，所以限定最小时间为5/30秒
    let time = Math.max(((frameIndex - 1) / baseFps * 1e6), 5 / 30 * 1e6);
    // 使用计算出的时间点获取画面帧
    const frame = (await (clip as MP4Clip).tick(time));

    // 返回获取到的画面帧
    return frame.video;
  }
}

class ImageDecoder {
  #decoderMap = new Map<string, VideoFrame[]>();
  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {
    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id);
    }

    stream = await writeFile(id, stream);

    if (!type) {
      throw new Error("type is not ready");
    }

    // 接收的数据可能是远程数据（URL），也可能是本地数据（file）
    // 如果是远程数据，可以直接使用URL作为source，
    // 如果是本地数据，可以使用FileReader读取数据，然后使用URL.createObjectURL创建URL作为source，但是这样缓存数据没法还原为File对象
    // 要解决这个问题，可以引入https://hughfenghen.github.io/posts/2024/03/14/web-storage-and-opfs/
    // 但是这样会增加复杂度，所以暂时不考虑，
    // TODO: 使用OPFS解决本地数据问题
    if (!stream) {
      throw new Error("stream is not ready");
    }
    const frames = await decodeImg(
      stream,
      type,
    );

    // 存储解析后的帧
    this.#decoderMap.set(id, frames);

    return frames;
  }

  async getFrame(id: string, frameIndex: number) {
    let frames = this.#decoderMap.get(id);
    if (!frames) {
      frames = await this.decode({ id });
    }
    return frames?.[frameIndex % frames.length];
  }
}

class AudioDecoder {
  #decoderMap = new Map<string, AudioClip>();
  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {

    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id);
    }

    stream = await writeFile(id, stream);

    if (!type) {
      throw new Error("type is not ready");
    }

    const clip = new AudioClip(stream);

    if (!clip) {
      // 提示解析视频失败
      throw new Error("解析视频失败");
    }

    await clip.ready;

    this.#decoderMap.set(id, clip)

    return clip;
  }
}

export const splitClip = async (source: any, { offsetL, offsetR, frameCount }: { offsetL: number, offsetR: number, frameCount: number }) => {
  if (offsetL === 0 && offsetR === 0) {
    return source
  }
  const start = offsetL * UnitFrame2μs
  // 使用start裁剪视频
  const clip = offsetL === 0 ? source : (await source.split(start))[1];
  const end = (frameCount - offsetR - offsetL) * UnitFrame2μs;
  return offsetR === 0 ? clip : (await clip.split(end))[0];
}

export const videoDecoder = new VideoDecoder();

export const imageDecoder = new ImageDecoder();

export const audioDecoder = new AudioDecoder();