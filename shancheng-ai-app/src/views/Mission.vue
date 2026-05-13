<template>
  <div class="mission-page">
    <div class="top-nav shadow-sm d-flex align-items-center position-relative">
      <router-link to="/" class="back-link text-decoration-none text-dark fs-3 fw-bold position-absolute" style="left: 20px; z-index: 10;">
        ←
      </router-link>
      <h5 class="fw-bold m-0 text-center w-100">我的綠色成就</h5>
    </div>

    <div class="container py-4">
      <div class="points-card shadow">
        <div class="card-inner">
          <div class="points-header">累積綠色點數</div>
          <div class="points-value">350 <span class="unit">pt</span></div>
          <div class="level-tag">初階山城旅人</div>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-info">距離下一級還差 150 pt</div>
          <div class="bar-bg"><div class="bar-fill" style="width: 70%"></div></div>
        </div>
      </div>

      <h6 class="section-title">今日挑戰任務</h6>
      
      <div class="mission-list">
        <div v-for="m in missions" :key="m.title" class="mission-tile shadow-sm">
          <div class="tile-icon" :class="{ done: m.complete }">{{ m.icon }}</div>
          <div class="tile-info">
            <div class="mission-name">{{ m.title }}</div>
            <div class="mission-progress-text">進度：{{ m.progress }}</div>
            <div class="bar-bg mini"><div class="bar-fill" :style="{ width: m.percent + '%' }"></div></div>
          </div>
          <button class="btn-claim" :disabled="!m.complete">領取</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const missions = [
  { icon: '📷', title: '解鎖食農知識', progress: '3 / 3', percent: 100, complete: true },
  { icon: '🚶', title: '綠色路徑探險', progress: '1.2 / 3 km', percent: 40, complete: false },
  { icon: '🎧', title: '深度故事導覽', progress: '1 / 2 個', percent: 50, complete: false }
];
</script>

<style scoped>
.mission-page { background: #f8fafc; min-height: 100vh; padding-bottom: 80px; }
.top-nav { background: white; padding: 18px; }

.points-card {
  background: linear-gradient(135deg, #065f46 0%, #10b981 100%);
  border-radius: 28px; padding: 30px 24px; color: white; position: relative; overflow: hidden;
}
.points-header { font-size: 14px; opacity: 0.8; font-weight: 500; }
.points-value { font-size: 42px; font-weight: 800; margin: 5px 0; }
.points-value .unit { font-size: 16px; opacity: 0.8; }
.level-tag { background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 12px; }

.progress-bar-wrap { margin-top: 25px; }
.progress-info { font-size: 11px; margin-bottom: 6px; opacity: 0.9; }
.bar-bg { background: rgba(255,255,255,0.15); height: 8px; border-radius: 4px; overflow: hidden; }
.bar-fill { background: #bef264; height: 100%; border-radius: 4px; }

.section-title { font-size: 16px; font-weight: 700; color: #334155; margin: 30px 0 15px; }
.mission-tile {
  background: white; border-radius: 20px; padding: 18px; display: flex; align-items: center; gap: 15px; margin-bottom: 12px;
}
.tile-icon { width: 48px; height: 48px; background: #f1f5f9; border-radius: 14px; display: flex; justify-content: center; align-items: center; font-size: 20px; }
.tile-icon.done { background: #ecfdf5; border: 2px solid #10b981; }
.tile-info { flex-grow: 1; }
.mission-name { font-weight: 700; font-size: 15px; color: #1e293b; }
.mission-progress-text { font-size: 11px; color: #64748b; margin: 4px 0; }
.bar-bg.mini { height: 6px; background: #f1f5f9; }

.btn-claim {
  background: #f59e0b; color: white; border: none; padding: 6px 16px; border-radius: 10px; font-size: 13px; font-weight: 700;
}
.btn-claim:disabled { background: #e2e8f0; color: #94a3b8; }
</style>