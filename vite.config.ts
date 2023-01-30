import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3500,
        watch: {
            // 不监听 src/server 目录下的文件变化，这部分由 ts-node 负责
            ignored: path => path.includes('src/server/')
        },
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
    plugins: [react()],
    build: {
        outDir: 'dist/client',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        }
    }
})
