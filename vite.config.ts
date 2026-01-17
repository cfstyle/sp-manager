import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import monacoEditorNls, {
  Languages,
  esbuildPluginMonacoEditorNls
} from 'vite-plugin-monaco-editor-nls';

// Fix for CJS default export interop
const monacoEditorNlsPlugin = (monacoEditorNls as any).default || monacoEditorNls;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monacoEditorNlsPlugin({
      locale: Languages.zh_hans
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        esbuildPluginMonacoEditorNls({
          locale: Languages.zh_hans,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
