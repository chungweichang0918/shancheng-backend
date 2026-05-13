<template>
  <Navbar />
  <router-view />
  <BottomNav />
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import BottomNav from './components/BottomNav.vue'
</script>

<style>
/* 全域變數與基礎設定 */
:root {
  --tech-blue: #007bff;
  --eco-green: #28a745;
  --vibrant-yellow: #ffc107;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  background-color: #f8f9fa;
  padding-bottom: 70px; /* 留空間給底部導覽列 */
}

/* 讓 a 標籤預設沒有底線 */
a {
  text-decoration: none;
}
</style>