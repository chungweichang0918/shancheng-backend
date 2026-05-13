<template>
  <div class="home">
    <header class="hero-section">
      <div class="container hero-content position-relative z-1">
        <h1 class="fw-bold">今天想去哪裡探索山城？</h1>
        <p>專屬你的 AI 行程與智慧導覽</p>
        <router-link to="/form" class="btn-cta">開始 AI 行程推薦</router-link>
      </div>
    </header>

    <main class="container mb-5 mt-4">
      <div class="row g-4">
        <div class="col-6 col-md-3" v-for="item in features" :key="item.title">
          <router-link :to="item.link" class="text-decoration-none text-dark">
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
]
</script>

<style scoped>
.hero-section {
  min-height: 45vh;
  background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), 
              url('https://images.unsplash.com/photo-1627918828851-eb5d8174360e?q=80&w=1600&auto=format&fit=crop') no-repeat center center;
  background-size: cover; color: white; text-align: center;
  display: flex; align-items: center; justify-content: center;
  border-radius: 0 0 20px 20px;
}
.hero-content h1 { font-size: 2.5rem; margin-bottom: 15px; }
.btn-cta {
  background-color: var(--eco-green); color: white;
  padding: 12px 40px; border-radius: 50px; display: inline-block;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: all 0.2s;
}
.btn-cta:hover { transform: translateY(-2px); background-color: #218838; color: white;}
.feature-card {
  border: none; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  text-align: center; transition: all 0.2s;
}
.feature-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
.feature-card .card-body { padding: 30px 20px; }
.feature-icon { font-size: 32px; color: var(--eco-green); display: block; margin-bottom: 15px;}
.feature-card__title { font-weight: bold; margin-bottom: 5px; }
.feature-card__text { color: #666; font-size: 0.9rem; margin-bottom: 0; }
</style>