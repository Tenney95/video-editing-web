import process from 'node:process';
import path from 'node:path';
import { defineConfig, loadEnv } from "vite";
import { URL, fileURLToPath } from 'node:url';
import vue from "@vitejs/plugin-vue";
import Unocss from '@unocss/vite'
import Icons from 'unplugin-icons/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import vueDevTools from 'vite-plugin-vue-devtools';
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(configEnv => {
  const viteEnv = loadEnv(configEnv.mode, process.cwd());
  const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = viteEnv;
  const localIconPath = path.join(process.cwd(), 'src/assets/svg-icon');
  const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, '');

  return {
    base: viteEnv.VITE_BASE_URL,
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        }
      }
    },
    plugins: [
      vue(),
      vueDevTools(),
      Unocss({
        rules: [
          ['custom-rule', { color: 'red' }],
          [/^custom-(\d+)$/, ([, d]) => ({ margin: `${d}px` })],
        ]
      }),
      Icons({
        // 自动安装图标
        autoInstall: true,
        compiler: 'vue3',
        // 默认自定义 svg 格式图标的路径
        customCollections: {
          [collectionName]: FileSystemIconLoader(localIconPath, svg =>
            svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
          )
        },
        // 缩放比例：默认为 1
        scale: 1,
        // 默认类名
        defaultClass: 'inline-block'
      }),
      Components({
        resolvers: [
          IconsResolver({ customCollections: [collectionName], componentPrefix: VITE_ICON_PREFIX }),
        ]
      }),
      createSvgIconsPlugin({
        iconDirs: [localIconPath],
        symbolId: `${VITE_ICON_LOCAL_PREFIX}-[dir]-[name]`,
        inject: 'body-last',
        customDomId: '__SVG_ICON_LOCAL__'
      })
    ],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
          protocol: "ws",
          host,
          port: 1421,
        }
        : undefined,
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
    },

  }
});
