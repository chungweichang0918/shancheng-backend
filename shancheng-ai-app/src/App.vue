<template>
  <div id="app">
    <router-view />
    <nav class="bottom-nav shadow">
      <router-link to="/" class="nav-item"><div>🏠</div><div>{{ t.home }}</div></router-link>
      <router-link to="/form" class="nav-item"><div>🗺️</div><div>{{ t.plan }}</div></router-link>
      <router-link to="/guide" class="nav-item"><div>🎧</div><div>{{ t.guide }}</div></router-link>
      <router-link to="/scan" class="nav-item"><div>📷</div><div>{{ t.scan }}</div></router-link>
      <router-link to="/mission" class="nav-item"><div>🏅</div><div>{{ t.mission }}</div></router-link>
      <router-link to="/settings" class="nav-item"><div>⚙️</div><div>{{ t.settings }}</div></router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
const sysLang = ref(localStorage.getItem('shancheng_sys_lang') || 'zh');
const t = computed(() => {
  const dict = {
    zh: { home: '首頁', plan: '行程', guide: '導覽', scan: '辨識', mission: '任務', settings: '設定' },
    en: { home: 'Home', plan: 'Plan', guide: 'Guide', scan: 'Lens', mission: 'Mission', settings: 'Settings' },
    ja: { home: 'ホーム', plan: 'プラン', guide: 'ガイド', scan: 'スキャン', mission: 'タスク', settings: '設定' },
    ko: { home: '홈', plan: '일정', guide: '가이드', scan: '스캔', mission: '미션', settings: '설정' }
  };
  return dict[sysLang.value] || dict.zh;
});
</script>

<style>
body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f3f4f6; }
.bottom-nav { position: fixed; bottom: 0; width: 100%; background: white; display: flex; justify-content: space-around; padding: 10px 0; border-top: 1px solid #e5e7eb; z-index: 9999; padding-bottom: calc(10px + env(safe-area-inset-bottom)); }
.nav-item { text-align: center; text-decoration: none; color: #6b7280; font-size: 11px; font-weight: 600; transition: 0.2s; }
.nav-item div:first-child { font-size: 20px; margin-bottom: 2px; }
.router-link-active { color: #10b981; }
</style>
