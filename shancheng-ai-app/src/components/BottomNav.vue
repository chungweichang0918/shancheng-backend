<template>
  <nav class="bottom-nav d-md-none">
    <router-link to="/" class="bottom-nav__item" active-class="active">
      <div class="bottom-nav__icon">🏠</div> <span>首頁</span>
    </router-link>
    <router-link to="/form" class="bottom-nav__item" active-class="active">
      <div class="bottom-nav__icon">🗺️</div> <span>行程</span>
    </router-link>
    <router-link to="/scan" class="bottom-nav__item" active-class="active">
      <div class="bottom-nav__icon">📷</div> <span>辨識</span>
    </router-link>
    <router-link to="/mission" class="bottom-nav__item" active-class="active">
      <div class="bottom-nav__icon">🏅</div> <span>任務</span>
    </router-link>
    <router-link to="/settings" class="bottom-nav__item" active-class="active">
      <div class="bottom-nav__icon">⚙️</div> <span>設定</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed; bottom: 0; left: 0; width: 100%; height: 70px;
  background-color: white; border-top: 1px solid #dee2e6;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  display: flex; justify-content: space-around; align-items: center;
  z-index: 1030;
}
.bottom-nav__item {
  display: flex; flex-direction: column; align-items: center;
  color: #666; font-size: 0.8rem;
}
.bottom-nav__item.active { color: var(--eco-green); }
.bottom-nav__icon { font-size: 20px; margin-bottom: 2px; }
@media (min-width: 768px) { .bottom-nav { display: none; } }
</style>