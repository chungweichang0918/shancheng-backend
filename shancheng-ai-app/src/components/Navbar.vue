<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
    <div class="container">
      <router-link class="navbar-brand d-flex align-items-center gap-2 fw-bold text-success" to="/" @click="closeMenu">
        <div class="app-logo-viz"></div>
        <span>山城 AI 智慧旅伴</span>
      </router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/" @click="closeMenu">首頁</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/mission" @click="closeMenu">我的集章</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/settings" @click="closeMenu">設定</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
// 定義一個用來收起選單的函數
const closeMenu = () => {
  // 抓取選單的 DOM 元素
  const navbarCollapse = document.getElementById('navbarNav');
  
  // 檢查選單是否處於「展開」狀態 (帶有 'show' 這個 class)
  if (navbarCollapse && navbarCollapse.classList.contains('show')) {
    // 透過我們在 index.html 引入的全域 bootstrap 物件，呼叫 hide() 把選單收起來
    if (window.bootstrap) {
      const bsCollapse = window.bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }
  }
};
</script>

<style scoped>
.app-logo-viz {
  width: 40px; height: 40px;
  background-color: var(--eco-green);
  border-radius: 50%;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.app-logo-viz::before {
  content: ''; position: absolute;
  bottom: -10px; left: 5px;
  width: 30px; height: 30px;
  background-color: white; transform: rotate(45deg);
}
.app-logo-viz::after {
  content: '✦'; position: absolute;
  top: 5px; right: 5px;
  color: var(--vibrant-yellow); font-size: 14px; font-weight: bold;
}
</style>