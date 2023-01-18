import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginImp from 'vite-plugin-imp'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    server: {
        port: 3500,
        proxy: {
            '/api/': {
                target: 'http://localhost:3600/',
                changeOrigin: true,
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        },
    },
    plugins: [react(), vitePluginImp()],
    build: {
        outDir: 'dist/client',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        }
    }
})