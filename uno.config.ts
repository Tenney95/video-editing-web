import { defineConfig } from '@unocss/vite';
import transformerDirectives from '@unocss/transformer-directives';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import presetUno from '@unocss/preset-uno';
import type { Theme } from '@unocss/preset-uno';
import { presetDreamDrawingAi } from '@sa/uno-preset';
import { themeVars } from './src/theme/vars';

export default defineConfig<Theme>({
  content: {
    pipeline: {
      exclude: ['node_modules', 'dist']
    }
  },
  theme: {
    ...themeVars,
    fontSize: {
      'icon-xs': '0.875rem',
      'icon-small': '1rem',
      icon: '1.125rem',
      'icon-large': '1.5rem',
      'icon-xl': '2rem'
    }
  },
  shortcuts: [
    {
      'card-wrapper': 'rd-8px shadow-sm',
      center: 'flex justify-center items-center'
    }
  ],
  rules: [
    // 匹配 br-20 这种不带单位的情况
    [/^br-(\d+)$/, ([, d]) => ({ 'border-radius': `${d}px` })],
    // 匹配 br-20px 这种带单位的情况
    [/^br-(\d+)px$/, ([, d]) => ({ 'border-radius': `${d}px` })],
    // 捕获 br-[value] 并应用自定义 border-radius 值
    [/^br-\[(.+)\]$/, ([, value]) => ({ 'border-radius': value })]
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [presetUno({ dark: 'class' }), presetDreamDrawingAi()]
});
