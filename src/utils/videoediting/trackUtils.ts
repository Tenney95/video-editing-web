import { AudioTrack } from '@/class/AudioTrack';
import { VideoTrack } from '@/class/VideoTrack';

type TypeGuard<T> = (value: unknown) => value is T;

/**
 * 检查轨道项目是否重叠  checkItem 是否与当前 trackList 存在帧重叠部分
 * 
 * 此函数用于检查给定的轨道项目（checkItem）是否与轨道列表（trackList）中的其他项目重叠
 * 它通过比较时间线上的开始和结束位置来确定是否存在重叠
 * 
 * @param trackList 轨道列表，包含多个轨道项目
 * @param checkItem 需要检查的轨道项目
 * @returns 返回一个对象，包含是否有重叠（hasOverlap）、重叠的索引（overLapIndex）和插入的索引（insertIndex）
 */
export function checkTrackItemOverlap(trackList: VideoEditing.BaseTrackItem[], checkItem: VideoEditing.BaseTrackItem) {
    // 获取待检查项目的开始和结束时间
    const { start: insertStart, end: insertEnd } = checkItem;
    // 初始化重叠索引为-1，表示没有重叠
    let overLapIndex = -1;
    // 初始化插入索引为0，表示待检查项目默认插入在列表的开始位置
    let insertIndex = 0;
    // 使用filter和some方法遍历轨道列表，排除待检查项目本身，检查是否存在重叠
    const hasOverlap = trackList.filter(item => item.id !== checkItem.id).some((trackItem, index) => {
        // 获取当前遍历项目的开始和结束时间
        const { start, end } = trackItem;
        /**
         * 判断是否重叠：
         * 1. 落点在节点内部，重叠:start < insertStart < end || start < insertEnd < end
         * 2. 落点在节点外，但是落点在两边，重叠:start >= insertStart && end <= insertEnd
         */
        if (
            (start < insertStart && insertStart < end) ||
            (start < insertEnd && insertEnd < end) ||
            (start >= insertStart && end <= insertEnd)
        ) {
            // 如果发现重叠，记录重叠项目的索引，并终止遍历
            overLapIndex = index;
            return true;
        } else {
            // 如果当前项目结束时间小于等于待检查项目开始时间，更新插入索引
            if (end <= insertStart) {
                insertIndex = index + 1;
            }
            // 继续遍历其他项目
            return false;
        }
    });
    // 返回检查结果，包括是否有重叠、重叠的索引和插入的索引
    return {
        hasOverlap,
        overLapIndex,
        insertIndex
    };
}


/**
 * 检查给定的值是否是可播放的视频或音频轨道类型
 * 
 * 该函数用于确定一个值是否属于 VideoTrack 或 AudioTrack 类型，主要用于多媒体播放场景中
 * 它通过对值进行实例检查来判断其是否为 VideoTrack 或 AudioTrack 类型之一
 * 
 * @param value 任意类型的值，待检查是否为可播放的轨道类型
 * @returns 如果值是 VideoTrack 或 AudioTrack 类型，则返回 true，否则返回 false
 */
export function isOfCanPlayType(value: unknown): value is VideoTrack | AudioTrack {
    return value instanceof VideoTrack || value instanceof AudioTrack;
}

/**
 * 根据当前帧数获取轨道项目列表中符合条件的项目
 * 
 * 此函数通过遍历轨道列表中的每个项目，检查其开始和结束帧是否包含当前帧，
 * 并使用类型守卫函数验证项目类型，从而筛选出符合条件的轨道项目
 * 
 * @param trackList 轨道列表数组，每个元素包含一个轨道上的项目列表
 * @param currentFrame 当前帧数，用于判断轨道项目是否处于当前播放位置
 * @param isOfType 类型守卫函数，用于检查轨道项目是否为指定类型T
 * @returns 返回一个数组，包含所有符合条件的轨道项目
 */
export const getCurrentTrackItemList = <T>(trackList: VideoEditing.TrackListEntry[], currentFrame: number, isOfType: TypeGuard<T>): T[] => {
    // 初始化一个空数组，用于存储符合条件的轨道项目
    const trackItems: T[] = [];

    // 遍历轨道列表的每个元素，每个元素包含一个轨道上的项目列表
    trackList.forEach(({ list }) => {
        // 遍历当前轨道上的每个项目
        list.forEach(trackItem => {
            // 获取当前轨道项目的开始和结束帧数
            const { start, end } = trackItem;

            // 检查当前轨道项目是否在当前帧数范围内，并且通过类型守卫函数验证项目类型
            if (start <= currentFrame && end >= currentFrame && isOfType(trackItem)) {
                // 如果符合条件，将轨道项目添加到结果数组中
                trackItems.push(trackItem);
            }
        });
    });

    // 返回所有符合条件的轨道项目数组
    return trackItems;
};