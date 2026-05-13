<!doctype html>
<template>
  <div class="home-container">
    <header class="hero-section">
      <div class="container hero-content">
        <h1>今天想去哪裡探索山城？</h1>
        <p>專屬你的 AI 行程與智慧導覽</p>
        <router-link to="/form" class="btn-cta">開始 AI 行程推薦</router-link>
      </div>
    </header>

    <main class="container mb-5">
      <div class="row g-4">
        <div v-for="item in features" :key="item.title" class="col-6 col-md-3">
          <router-link :to="item.link" class="text-decoration-none">
            <div class="card feature-card h-100">
              <div class="card-body">
                <span class="feature-icon">{{ item.icon }}</span>
                <h5 class="feature-card__title">{{ item.title }}</h5>
                <p class="feature-card__text">{{ item.desc }}</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
const features = [
  { title: 'AI 行程推薦', desc: '客製化旅遊路線', icon: '🗺️', link: '/form' },
  { title: '智慧景點導覽', desc: '中/英/台語音故事', icon: '🎧', link: '/guide' },
  { title: '農作物辨識', desc: '解鎖食農知識', icon: '📷', link: '/scan' },
  { title: '集章綠色任務', desc: '完成獲得優惠券', icon: '🏅', link: '/mission' }
];
</script>
