export const TrackHeightMap = new Map([
    ['video', '80px'],
    ['audio', '40px'],
    ['text', '20px'],
    ['image', '20px'],
    ['effect', '20px'],
    ['filter', '20px'],
    ['transition', '20px']
]);

export const baseFps = 30;

/**
 * 单位帧时间，毫秒
 */
export const UnitFrame2ms = 1e3 / baseFps;
/**
 * 单位帧时间，微秒
 */
export const UnitFrame2μs = 1e6 / baseFps;