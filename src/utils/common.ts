
import { baseFps } from '@/data/trackConfig';

/**
 *  时间格式化
 * */
export function formatTime(time: number) {
  let second = Math.ceil(time / 1000);
  const s = second % 60;
  second = Math.floor(second / 60);
  const m = second % 60;
  second = Math.floor(second / 60);
  const h = second % 60;
  return {
    s,
    m,
    h,
    str: `${h === 0 ? '' : `${h < 10 ? '0' : ''}${h}:`}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
  };
}
export function formatPlayerTime(frameCount: number) {
  let f = Math.round(frameCount % 30);
  frameCount = Math.floor(frameCount / 30);
  let s = frameCount % 60;
  frameCount = Math.floor(frameCount / 60);
  let m = frameCount % 60;
  frameCount = Math.floor(frameCount / 60);
  let h = frameCount;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}:${f < 10 ? '0' : ''}${f}`;
}

// 生成 16 进制指定长度的字符串
function getRandom(len: number) {
  return Math.floor((1 + Math.random()) * (16 ** len))
    .toString(16)
    .substring(1);
}

/**
 *  获取随机ID，组件拖到预览视图后就会被设置个ID
 * */
export function getId(prefix = 't') {
  return `${prefix ? `${prefix}-` : ''}${getRandom(5)}${getRandom(3)}-${getRandom(4)}`;
}
/**
 * 下载文件
 * */
export function downloadFileUrl(href: string, fileName: string) {
  const downloadElement = document.createElement('a');
  downloadElement.href = href;
  // 下载后文件名
  downloadElement.download = fileName;
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
  // 释放掉blob对象
  window.URL.revokeObjectURL(href);
  downloadElement.href = '';
}
/**
 * 根据中心点计算左上角顶点位置
 */
export function calcLeftTopByCenter(center: { x: number, y: number }, width: number, height: number) {
  return {
    left: center.x - width / 2,
    top: center.y - height / 2
  };
}

// 获取canvas中文本应该显示的宽高
// export function getTextRect({ text = 'Hello World', fontSize = 40 }) {
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');
//     if (ctx) {
//         ctx.font = `${fontSize}px -apple-system, ".SFNSText-Regular", "SF UI Text", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", "WenQuanYi Zen Hei", "Microsoft YaHei", Arial, sans-serif`;
//         const metrics = ctx.measureText(text);
//         return {
//             width: metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft,
//             height: fontSize * 1.2
//         };
//     }
//     return null;
// }

// 定义一个全局的 OffscreenCanvas 和上下文，避免重复创建
let sharedCanvas: OffscreenCanvas | null = null;
let sharedCtx: OffscreenCanvasRenderingContext2D | null = null;
export function getTextRect({ text = 'Hello World', fontSize = 40, fontFamily = 'Arial' }: {
  text?: string,
  fontSize?: number,
  fontFamily?: string
}) {
  const padding = 4;

  // 初始化共享的 Canvas 和上下文
  if (!sharedCanvas || !sharedCtx) {
    sharedCanvas = new OffscreenCanvas(1000, 1000);
    sharedCtx = sharedCanvas.getContext('2d');
    if (!sharedCtx) {
      throw new Error('Canvas 2D context is not supported');
    }
  }

  const ctx = sharedCtx!;

  // 检查输入的有效性
  if (typeof text !== 'string') {
    throw new Error('Invalid text input');
  }
  if (typeof fontSize !== 'number' || fontSize <= 0) {
    throw new Error('Invalid font size');
  }
  if (typeof fontFamily !== 'string' || fontFamily.trim() === '') {
    throw new Error('Invalid font family');
  }

  const lines = text.split('\n');
  ctx.font = `${fontSize}px ${fontFamily}`;
  const lineHeight = fontSize * 1.2; // Adjust line height as needed

  // Measure the widest line
  const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));

  // Calculate total height
  const totalHeight = lines.length * lineHeight;

  return {
    width: textWidth + padding * 2,
    height: totalHeight + padding * 2,
    lineHeight,
    lines
  };
}

export function calcTrackItemAttr(trackItem: Record<string, any>, canvasSize: { width: number, height: number }, trackAttr: Record<string, any> = {}) {
  console.log(trackAttr);
  const { width: sourceWidth, height: sourceHeight, type, text = '默认文本', fontSize = 40, style } = trackItem;
  const { width: playerW, height: playerH } = canvasSize;
  let defaultW = playerW;
  let defaultH = playerH;
  if (['image', 'video'].includes(type)) {
    const proportionalW = Math.floor(playerH / sourceHeight * sourceWidth); // 等高宽度
    const proportionalH = Math.floor(playerW / sourceWidth * sourceHeight); // 等宽高度
    // 默认渲染位置
    if (proportionalW > playerW) { // 等高场景下宽度溢出，则采用等宽， 高度上下留白
      defaultH = proportionalH;
    } else if (proportionalH > playerH) { // 等宽场景下高度溢出，则采用等高， 宽度左右留白
      defaultW = proportionalW;
    }

    if (sourceHeight < defaultH && sourceWidth < defaultW) {
      defaultW = sourceWidth;
      defaultH = sourceHeight;
    }
  }

  if (type === 'text') {
    const rect = getTextRect({ text, fontSize });
    console.log('🚀 ~ calcTrackItemAttr ~ rect:', rect);
    if (rect) {
      defaultW = rect.width;
      defaultH = rect.height;
    }
  }
  return {
    width: defaultW,
    height: defaultH,
    centerX: 0,
    centerY: 0,
    scale: 100,
    drawWidth: defaultW,
    drawHeight: defaultH,
    text,
    fontSize,
    // color: style.fill,
    style
  };
}

export function computedItemShowArea(trackItem: Record<string, any>, canvasSize: { width: number, height: number }, trackAttr: Record<string, any>) {
  let { left = 0, top = 0, scale = 100, text, fontSize } = trackAttr;
  const { width, height, type } = trackItem;
  const { width: playerW, height: playerH } = canvasSize;
  let defaultW = playerW;
  let defaultH = playerH;
  if (type === 'video') {
    const proportionalW = Math.floor(playerH / height * width); // 等高宽度
    const proportionalH = Math.floor(playerW / width * height); // 等宽高度
    // 默认渲染位置
    if (proportionalW > playerW) { // 等高场景下宽度溢出，则采用等宽， 高度上下留白
      defaultH = proportionalH;
    } else if (proportionalH > playerH) { // 等宽场景下高度溢出，则采用等高， 宽度左右留白
      defaultW = proportionalW;
    }
  }
  if (type === 'image') {
    defaultW = width;
    defaultH = width;
  }
  if (type === 'text') {
    defaultW = text.length * fontSize;
    defaultH = fontSize * 1.2;
  }
  // 由默认位置计算偏移缩放位置
  const scaleW = Math.floor(defaultW * scale / 100);
  const scaleH = Math.floor(defaultH * scale / 100);
  const scaleL = Math.floor(left + (defaultW - scaleW) / 2);
  const scaleT = Math.floor(top + (defaultH - scaleH) / 2);
  const diffW = Math.floor(playerW - scaleW);
  const diffH = Math.floor(playerH - scaleH);
  return {
    drawL: scaleL,
    drawT: scaleT,
    drawW: scaleW,
    drawH: scaleH,
    sourceWidth: width,
    sourceHeight: height,
    defaultW,
    defaultH,
    diffW,
    diffH
  };
}
export function isVideo(type: string) {
  return type === 'video';
}
// 封装json格式化, 避免error
export function getJsonParse(jsonStr: string): any {
  let res = '';
  try {
    res = JSON.parse(jsonStr);
  } catch (e) {
    console.log(e);
    res = '';
  }
  return res;
}

export const file2ArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      resolve(e.target?.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  });
};

export const file2Unit8Stream = async (file: File): Promise<ReadableStream<Uint8Array>> => {
  const unit8Array = new Uint8Array(await file2ArrayBuffer(file));
  // 创建一个空的 ReadableStream
  return new ReadableStream({
    start(controller) {
      // 使用 enqueue 方法将 Uint8Array 推送到 ReadableStream
      controller.enqueue(unit8Array);

      // 关闭 ReadableStream，表示没有更多的数据会被推送
      controller.close();
    }
  });
};
/**
 * 获取当前字幕
 * @param asr 
 * @param frame 
 */
export const getCurSubtitle = (asr: { beginTime: number, endTime: number, text: string }[], frame: number) => {
  // 将frame转换为当前时间
  const time = frame * 1000 / baseFps;
  // 当time在beginTime和endTime之间时，返回当前字幕
  for (let i = 0; i < asr.length; i++) {
    const { beginTime, endTime, text } = asr[i];
    if (time >= beginTime && time <= endTime) {
      return text;
    }
  }
  return '';
};


/**
 * 创建一个精确间隔的定时器
 * 
 * 该函数使用requestAnimationFrame来实现一个尽可能接近给定间隔的定时器它比setInterval更精确，
 * 因为它能够根据实际的帧渲染时间来调整间隔，从而减少累积误差
 * 
 * @param callback 定时器触发时执行的回调函数
 * @param interval 定时器的间隔时间，以毫秒为单位
 * @returns 返回一个对象，包含一个cancel方法，用于停止定时器
 */
export function preciseInterval(callback: () => void, interval: number) {
  // 初始化期望的下一次执行时间
  let expected = performance.now() + interval;
  // 初始化停止标志
  let stop = false;

  /**
   * 定时器的内部执行步骤
   * 
   * 该函数会根据当前时间与期望执行时间的比较，决定是否执行回调函数，并更新期望的下一次执行时间
   * 
   * @param timestamp 当前的高精度时间戳
   */
  function step(timestamp: number) {
    // 如果设置了停止标志，则停止执行
    if (stop) return;

    // 如果当前时间大于或等于期望执行时间，则执行回调函数
    if (timestamp >= expected) {
      callback();
      // 累积期望的时间，以保持精确的间隔
      expected += interval;
    }

    // 请求下一帧动画，用于递归调用自身
    requestAnimationFrame(step);
  }

  // 启动定时器
  requestAnimationFrame(step);

  // 返回一个对象包含取消方法
  return {
    /**
     * 取消定时器的执行
     */
    cancel: () => {
      // 设置停止标志为true
      stop = true;
    }
  };
}

export async function createFileWriter(
  extName = 'mp4'
): Promise<FileSystemWritableFileStream> {
  if (!('showSaveFilePicker' in window)) {
    throw new Error('showSaveFilePicker is not supported in this browser.');
  }
  const fileHandle = await (window as any).showSaveFilePicker({
    suggestedName: `WebAV-export-${Date.now()}.${extName}`
  });

  return fileHandle.createWritable();
}
/**
 * Toggle html class
 *
 * @param className
 */
export function toggleHtmlClass(className: string) {
  function add() {
    document.documentElement.classList.add(className);
  }

  function remove() {
    document.documentElement.classList.remove(className);
  }

  return {
    add,
    remove
  };
}

/**
 * 创建一个节流函数，用于限制函数的执行频率。 节流函数确保在指定的时间间隔内，即使被多次调用，原始函数也只会执行一次。 如果原始函数返回 Promise，节流函数将捕获并处理 Promise 中的错误。
 *
 * @param func 要节流的原始函数，可以接受任意参数并返回 void 或 Promise<void>。
 * @param delay 执行间隔的时间，单位为毫秒。
 * @returns 返回一个新的节流函数，接受与原始函数相同的参数，但不返回任何值。
 */
export function throttle<T extends (...args: any[]) => void | Promise<void>>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function throttledFunction(...args: Parameters<T>) {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      const result = func(...args);

      // 如果 result 是 Promise，则添加错误捕获
      if (result instanceof Promise) {
        result.catch(error => {
          console.error('Error in throttled function:', error);
        });
      }
    }
  };
}

// 替换中文逗号为英文逗号，并确保结尾有英文逗号
export const replaceChineseComma = (text: string): string => {
  if (text === '') return '';
  // 替换中文逗号为英文逗号
  let newText = text.replace(/，/g, ',');
  // 如果结尾没有逗号，则添加
  if (!newText.endsWith(',')) {
    newText += ',';
  }
  return newText;
};

/**
 * 解码图像流，返回一个视频帧数组。
 *
 * @param stream - 包含图像数据的可读流。
 * @param type - 图像的 MIME 类型，例如 'image/jpeg'。
 *
 * @returns 返回一个 Promise，该 Promise 在解码完成后解析为 {@link VideoFrame} 数组。
 *
 * @see [解码动图](https://bilibili.github.io/WebAV/demo/1_3-decode-image)
 *
 * @example
 *
 * const frames = await decodeImg(
 *   (await fetch('<gif url>')).body!,
 *   `image/gif`,
 * );
 */
export async function decodeImg(
  stream: ReadableStream<Uint8Array>,
  type: string,
): Promise<VideoFrame[]> {
  const init = {
    type,
    data: stream,
  };
  const imageDecoder = new (window as any).ImageDecoder(init);

  await Promise.all([imageDecoder.completed, imageDecoder.tracks.ready]);

  let frameCnt = imageDecoder.tracks.selectedTrack?.frameCount ?? 1;

  const rs: VideoFrame[] = [];
  for (let i = 0; i < frameCnt; i += 1) {
    rs.push((await imageDecoder.decode({ frameIndex: i })).image);
  }
  return rs;
}

/**
 * 压缩 Blob 格式的图像
 * @param {Blob} imageBlob
 * @param {number} quality 压缩质量，范围 0 ~ 1，值越小压缩比越高，图片质量越差。默认为 0.5
 * @param {number} maxWidth 最大宽度，如果图片宽度超过这个值，则会按比例压缩，默认为 1000
 * @returns {Promise<Blob>} 返回压缩后的 Blob 对象
 */
export async function compressImageBlob(
  imageBlob: Blob,
  quality: number = 0.5,
  maxWidth: number = 1000
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageBlob);

    img.onload = () => {
      URL.revokeObjectURL(imageUrl); // 释放 URL

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 如果宽度超过了最大宽度，进行按比例缩放
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2d context from canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // 使用 toBlob 方法压缩图像，MIME 类型为 'image/jpeg'
      canvas.toBlob(
        (compressedBlob) => {
          if (compressedBlob) {
            resolve(compressedBlob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg', // 使用 jpeg 可以获得更高压缩比
        quality
      );
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Failed to load image:' + error));
    }

    img.src = imageUrl;
  });
}

// 新增的 Blob 转 Base64 函数
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('reader.result is not a string'))
      }

    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
