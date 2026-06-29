import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import pkg from './package.json'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const base = '/mental-calc/'
const config = defineConfig({
    base,
    define: {
        'APP_VERSION': JSON.stringify(pkg.version),
    },
    resolve: { tsconfigPaths: true },
    plugins: [
        devtools(),
        tailwindcss(),
        tanstackRouter({ target: 'react', autoCodeSplitting: true }),
        viteReact(),
        VitePWA({
            registerType: 'autoUpdate', // 自动检测更新+刷新
            manifest: {
                name: 'Mental Calc-速算练习',
                short_name: 'Mental Calc',
                start_url: '/mental-calc/practice',
                scope: '/mental-calc/',
                display: 'standalone', // 独立App窗口，无浏览器地址栏
                background_color: '#ffffff',
                theme_color: '#165DFF',
                icons: [
                    {
                        src: 'icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ]
            },
            workbox: {
                // Hash路由关键：所有#导航都走index.html兜底
                navigateFallback: 'index.html',
                // 匹配所有hash路由路径
                navigateFallbackAllowlist: [/./],
                globPatterns: ['**/*.{html,js,css,ico,png,svg}']
            },
            devOptions: {
                // 开发环境开启SW调试
                enabled: true,
                type: 'module'
            }
        }) as any
    ],
})

export default config
