import { usePlayerState } from '@/store/modules/videoediting/playerState';
import { useTrackState } from '@/store/modules/videoediting/trackState';
import { watch, reactive, onMounted, toRaw } from 'vue';
import type { Ref } from 'vue';
export class CanvasPlayer {
    player: Ref<HTMLCanvasElement>; // 播放器
    playerContext: ImageBitmapRenderingContext | null = null;
    playerStore: Record<string, any>;
    trackState: Record<string, any>;
    containerSize: Record<string, any>;
    canvasSize = reactive({
        width: 0,
        height: 0
    });
    constructor(options: Record<string, any>) {
        this.player = options.player;
        this.containerSize = options.containerSize;

        onMounted(() => {
            this.playerContext = this.player.value.getContext('bitmaprenderer');
        });

        this.playerStore = usePlayerState();
        this.trackState = useTrackState();
        this.initWatch();
    }
    initWatch() {
        // 容器大小变化
        // watch([this.containerSize], () => {
        //     this.updateCanvasSize();
        // });
        // 属性变化后重新渲染
        watch([() => this.trackState.trackList, () => this.canvasSize, () => this.playerStore.playStartFrame], () => this.drawCanvas(), { deep: true });
    }
    // 绘制
    async drawCanvas() {
        if (this.playerStore.ingLoadingCount !== 0) return;
        const offCanvas = new OffscreenCanvas(this.playerStore.playerWidth, this.playerStore.playerHeight);
        const ctx = offCanvas.getContext('2d');
        const videoList: Array<() => Promise<void>> = []; // 修改类型，表示函数返回Promise

        for (const { list } of this.trackState.trackList) {  // 直接解构赋值
            const trackItem = list.find((item: VideoEditing.TrackItem) => {  // 使用正确的类型定义
                if (this.playerStore.playStartFrame >= item.start && this.playerStore.playStartFrame <= item.end && !['audio'].includes(item.type)) {
                    return true;
                }
                return false;
            });

            if (trackItem) {
                videoList.unshift(() => this.drawToRenderCanvas(ctx, trackItem, this.playerStore.playStartFrame));
            }
        }
        // 顺序绘制，保证视频在底部
        await videoList.reduce((chain, nextPromise) => chain.then(() => nextPromise()), Promise.resolve());
        this.drawToPlayerCanvas(offCanvas);
    }
    // 预渲染canvas先加载
    drawToRenderCanvas(ctx: OffscreenCanvasRenderingContext2D | null, trackItem: Record<string, any>, frameIndex: number) {
        return toRaw(trackItem).draw(ctx, { width: this.playerStore.playerWidth, height: this.playerStore.playerHeight }, frameIndex)
            .then(() => {
                return true;
            });
    }
    // 将预渲染好的canvas进行渲播放器渲染
    async drawToPlayerCanvas(canvas: OffscreenCanvas) {
        if (this.playerContext) {
            this.playerContext.transferFromImageBitmap(canvas.transferToImageBitmap());
        }
    }
}
