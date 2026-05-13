<template>
  <div class="form-container">
    <div class="header-nav shadow-sm d-flex align-items-center">
      <router-link to="/" class="back-link text-decoration-none text-dark fs-3 fw-bold">←</router-link>
      <h2 class="page-title ms-3">規劃專屬行程</h2>
    </div>

    <div class="container py-4 main-content">
      <section class="form-section">
        <h5 class="section-label">1. 誰與您同行？</h5>
        <div class="selection-grid">
          <div v-for="opt in audienceOptions" :key="opt.id" class="option-item">
            <input type="radio" :id="opt.id" :value="opt.label" v-model="selectedAudience" class="hidden-radio">
            <label :for="opt.id" class="selection-card">
              <span class="emoji">{{ opt.icon }}</span><span class="label">{{ opt.label }}</span>
            </label>
          </div>
        </div>
      </section>

      <section class="form-section mt-4">
        <h5 class="section-label">2. 預計停留時間？</h5>
        <div class="selection-grid two-cols">
          <div v-for="opt in durationOptions" :key="opt.id" class="option-item">
            <input type="radio" :id="opt.id" :value="opt.label" v-model="selectedDuration" class="hidden-radio">
            <label :for="opt.id" class="selection-card">
              <span class="emoji">{{ opt.icon }}</span><span class="label">{{ opt.label }}</span>
            </label>
          </div>
        </div>
      </section>

      <section class="form-section mt-4">
        <h5 class="section-label">3. 您的興趣偏好 (可複選)</h5>
        <div class="selection-grid">
          <div v-for="opt in prefOptions" :key="opt.id" class="option-item">
            <input type="checkbox" :id="opt.id" :value="opt.label" v-model="selectedPreferences" class="hidden-radio">
            <label :for="opt.id" class="selection-card">
              <span class="emoji">{{ opt.icon }}</span><span class="label">{{ opt.label }}</span>
            </label>
          </div>
        </div>
      </section>
    </div>

    <div class="footer-btn-area">
      <button class="btn-ai-submit shadow" @click="fetchAIRecommendation(false)" :disabled="isSubmitting">
        <span v-if="!isSubmitting"><span class="sparkle">✨</span> AI 開始規劃專屬行程</span>
        <span v-else>⏳ 串接 Gemini 運算中...</span>
      </button>
    </div>

    <div class="ai-result-overlay" :class="{ 'active': showResult }">
      <div class="overlay-backdrop" @click="closeResult"></div>
      <div class="result-card">
        <div class="drag-handle"></div>
        
        <div v-if="isRegenerating" class="loading-state-box">
          <div class="spinner-border text-success mb-3" role="status"></div>
          <h5 class="fw-bold text-dark">正在為您探索私房秘境...</h5>
          <p class="text-muted small">Gemini 正在重新規劃不同路線</p>
        </div>

        <div v-else class="result-content-wrap">
          <div class="result-header">
            <div class="icon-sparkle">✨</div>
            <h3 class="result-title">{{ aiResultTitle }}</h3>
          </div>
          <div class="result-content">
            <p class="result-text">{{ aiResultText }}</p>
          </div>
          
          <div class="result-actions">
            <button class="btn-start-journey mb-2" @click="closeResult">太棒了，就決定是這個！</button>
            <button class="btn-regenerate" @click="fetchAIRecommendation(true)">
              <i class="fa-solid fa-rotate-right me-1"></i> 想看其他路線 (重新生成)
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const audienceOptions = [
  { id: 'aud-f', icon: '👨‍👩‍👧', label: '親子' },
  { id: 'aud-c', icon: '👩‍❤️‍👨', label: '情侶' },
  { id: 'aud-s', icon: '🧓', label: '銀髮族' }
];
const durationOptions = [
  { id: 'dur-h', icon: '🌤️', label: '半日遊' },
  { id: 'dur-f', icon: '☀️', label: '一日遊' }
];
const prefOptions = [
  { id: 'p-e', icon: '🌿', label: '生態探索' },
  { id: 'p-f', icon: '🍲', label: '美食旅遊' },
  { id: 'p-p', icon: '📷', label: '攝影景點' }
];

const selectedAudience = ref('親子');
const selectedDuration = ref('一日遊');
const selectedPreferences = ref([]);

// 狀態控制變數
const isSubmitting = ref(false);     // 控制底部的首度送出按鈕
const isRegenerating = ref(false);   // 控制卡片內部的重新生成狀態
const showResult = ref(false);
const aiResultTitle = ref('');
const aiResultText = ref('');

// 🌟 將 API 呼叫獨立成一個共用函數，並加入 isRetry 參數
const fetchAIRecommendation = async (isRetry = false) => {
  if (selectedPreferences.value.length === 0) {
    alert("請至少選擇一個興趣偏好哦！");
    return;
  }

  // 根據情境切換不同的 loading 狀態
  if (isRetry) {
    isRegenerating.value = true;
  } else {
    isSubmitting.value = true;
  }

  try {
    // ⚠️ 記得把 IP 換成您手機測試用的 172.20.10.9
    const response = await fetch('https://shancheng-backend.onrender.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audience: selectedAudience.value,
        duration: selectedDuration.value,
        preferences: selectedPreferences.value,
        is_retry: isRetry  // 把重新生成的標記傳給後端
      })
    });

    const result = await response.json();
    
    if (result.status === "success") {
      aiResultTitle.value = result.data.title;
      aiResultText.value = result.data.preview;
      showResult.value = true; // 打開或保持卡片開啟
    } else {
      alert("AI 生成發生錯誤，請稍後再試！");
    }
  } catch (error) {
    console.error(error);
    alert('連線失敗！請確認 Python 伺服器是否有啟動。');
  } finally {
    isSubmitting.value = false;
    isRegenerating.value = false;
  }
};

const closeResult = () => {
  showResult.value = false;
};
</script>

<style scoped>
/* 前半段保持您原本的 CSS 不動，此處直接接續卡片的樣式 */
.form-container { background: #f9fafb; min-height: 100vh; padding-bottom: 140px; }
.header-nav { background: white; padding: 15px 20px; display: flex; align-items: center; gap: 15px; position: sticky; top: 0; z-index: 100; }
.back-link { color: #333; font-size: 20px; text-decoration: none; }
.page-title { font-size: 18px; font-weight: 700; margin: 0; color: #111827; }
.section-label { font-size: 15px; font-weight: 600; color: #6b7280; margin-bottom: 15px; }
.selection-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.selection-grid.two-cols { grid-template-columns: repeat(2, 1fr); }
.hidden-radio { position: absolute; opacity: 0; width: 0; height: 0; }
.selection-card { background: white; border: 2px solid #f3f4f6; border-radius: 16px; padding: 15px 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.selection-card .emoji { font-size: 24px; }
.selection-card .label { font-size: 14px; font-weight: 600; color: #374151; }
.hidden-radio:checked + .selection-card { border-color: #10b981; background: #ecfdf5; transform: scale(1.02); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1); }
.hidden-radio:checked + .selection-card .label { color: #065f46; }
.footer-btn-area { position: fixed; bottom: 70px; left: 0; width: 100%; padding: 15px 20px 20px; background: linear-gradient(0deg, #f9fafb 70%, transparent); z-index: 1020; }
.btn-ai-submit { width: 100%; background: #10b981; color: white; border: none; padding: 16px; border-radius: 50px; font-weight: 700; font-size: 16px; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.2s;}
.btn-ai-submit:disabled { background: #9ca3af; cursor: not-allowed; }
@media (min-width: 768px) { .footer-btn-area { bottom: 0; } }

/* 🌟 AI 結果展示卡與重試按鈕的 CSS */
.ai-result-overlay { position: fixed; inset: 0; z-index: 3000; display: flex; flex-direction: column; justify-content: flex-end; pointer-events: none; }
.ai-result-overlay.active { pointer-events: auto; }
.overlay-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); opacity: 0; transition: opacity 0.3s ease; }
.ai-result-overlay.active .overlay-backdrop { opacity: 1; }

.result-card {
  position: relative; background: white; border-radius: 30px 30px 0 0;
  padding: 30px 25px 40px; transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  box-shadow: 0 -10px 40px rgba(0,0,0,0.1); display: flex; flex-direction: column; min-height: 45vh; max-height: 85vh;
}
.ai-result-overlay.active .result-card { transform: translateY(0); }
.drag-handle { width: 40px; height: 5px; background: #e5e7eb; border-radius: 3px; margin: 0 auto 20px; }

/* 載入中狀態的置中排版 */
.loading-state-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  flex-grow: 1; padding: 40px 0; text-align: center;
}

.result-content-wrap { display: flex; flex-direction: column; flex-grow: 1; }
.result-header { display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px; }
.icon-sparkle { font-size: 32px; background: #ecfdf5; padding: 12px; border-radius: 16px; line-height: 1; }
.result-title { font-size: 22px; font-weight: 800; color: #111827; margin: 5px 0 0; line-height: 1.3; }

.result-content { overflow-y: auto; padding-right: 5px; margin-bottom: 30px; }
.result-text { font-size: 16px; color: #4b5563; line-height: 1.8; letter-spacing: 0.5px; white-space: pre-wrap; }

/* 雙按鈕設計 */
.result-actions { display: flex; flex-direction: column; gap: 10px; margin-top: auto; }
.btn-start-journey {
  width: 100%; background: #111827; color: white; border: none; padding: 16px;
  border-radius: 16px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(17, 24, 39, 0.2);
}
.btn-regenerate {
  width: 100%; background: transparent; color: #6b7280; border: 2px solid #e5e7eb; padding: 14px;
  border-radius: 16px; font-weight: 700; font-size: 15px; transition: 0.2s;
}
.btn-regenerate:active { background: #f3f4f6; color: #374151; }
</style>