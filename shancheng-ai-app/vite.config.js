import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate', // 自動在背景更新版本，不需要使用者手動重整
      includeAssets: ['favicon.svg', '*.jpg', '*.png'], // 將 public 裡的圖片加入靜態資源清單
      manifest: {
        name: '山城 AI 智慧旅伴',
        short_name: '山城旅伴',
        description: '專屬你的南投 AI 行程與智慧導覽',
        theme_color: '#10b981', // 配合你的綠色系 UI
        background_color: '#f8fafc',
        display: 'standalone', // 隱藏瀏覽器網址列，看起來像原生 App
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // 設定哪些檔案格式要被離線快取
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,vue}'],
        runtimeCaching: [
          {
            // 將外部的 FontAwesome 圖示快取起來
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fontawesome-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 快取一年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // 將使用者的大頭貼快取起來
            urlPattern: /^https:\/\/ui-avatars\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'avatar-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 快取 30 天
              }
            }
          }
        ]
      }
    })
  ]
})