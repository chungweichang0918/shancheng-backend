<template>
  <div class="scan-page">
    <video ref="videoRef" autoplay playsinline muted class="camera-stream"></video>
    <canvas ref="canvasRef" style="display: none;"></canvas>
    
    <div class="camera-ui-overlay">
      <router-link to="/" class="close-scan" @click="stopCamera">✕</router-link>
      <div class="scanner-frame">
        <div class="corner t-l"></div><div class="corner t-r"></div>
        <div class="corner b-l"></div><div class="corner b-r"></div>
      </div>
      <div class="camera-footer">
        <div class="instruction">{{ t.desc }}</div>
        <button class="shutter-btn" @click="handleShutterClick" :disabled="isUploading">
          <span v-if="isUploading" class="spinner-shutter"></span>
        </button>
      </div>
    </div>

    <div class="result-sheet" :class="{ active: showResult }">
      <div class="sheet-handle"></div>
      <div class="result-body">
        <div v-if="topPrediction" class="result-content-wrap">
          <div class="result-header">
            <div class="res-icon">🤖</div>
            <div>
              <div class="confidence">{{ t.aiParse }}</div>
              <h3 class="res-name">{{ topPrediction.className }}</h3>
            </div>
          </div>
          <div class="res-desc-container">
             <p class="res-desc">{{ topPrediction.description }}</p>
          </div>
          <div class="btn-group">
            <button class="btn-learn" @click="closeAndReturn" :class="{'bg-success': route.query.taskId}">
              {{ route.query.taskId ? t.taskSuccess : t.closeBtn }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 🌟 四國語言字典
const sysLang = ref(localStorage.getItem('shancheng_sys_lang') || 'zh');
const t = computed(() => {
  const dict = {
    zh: { desc: '對準南投在地植物、特產或風景，讓 AI 說故事給你聽！', closeBtn: '關閉繼續探索', taskSuccess: '✅ 任務驗證成功！點此返回領獎', aiParse: '雲端 OpenCV 解析' },
    en: { desc: 'Point at local plants or views for AI stories!', closeBtn: 'Close & Explore', taskSuccess: '✅ Mission Verified! Return', aiParse: 'Cloud AI Vision' },
    ja: { desc: '地元の植物や風景に向けてAIの話を聞こう！', closeBtn: '閉じて探索を続ける', taskSuccess: '✅ タスク完了！戻る', aiParse: 'AI ビジョン解析' },
    ko: { desc: '현지 식물이나 풍경을 가리키면 AI가 이야기를 들려줍니다!', closeBtn: '닫고 계속 탐색', taskSuccess: '✅ 미션 인증 성공! 돌아가기', aiParse: 'AI 비전 분석' }
  };
  return dict[sysLang.value] || dict.zh;
});

const NGROK_BASE_URL = "https://demystify-primary-correct.ngrok-free.dev";

const videoRef = ref(null);
const canvasRef = ref(null);
const showResult = ref(false);
const isUploading = ref(false);
const topPrediction = ref(null);
let stream = null;

onMounted(async () => {
  userStore.restoreSession();
  
  if (!userStore.isLoggedIn) {
    alert("🔒 AI 山城萬物鏡需要先登入才能解鎖喔！");
    router.push('/');
    return;
  }

  document.body.classList.add('hide-bottom-nav');

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    if (videoRef.value) videoRef.value.srcObject = stream;
  } catch (error) {
    alert("掃描功能需要您的相機權限才能正常運作哦！");
  }
});

const handleShutterClick = () => {
  if (!videoRef.value || !canvasRef.value) return;
  isUploading.value = true;
  
  const video = videoRef.value;
  const canvas = canvasRef.value;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'scan_image.jpg');
    // 🌟 核心修正：將當前的系統語言打包，一起送到後端給 AI 知道！
    formData.append('language', sysLang.value); 

    try {
      const response = await fetch(`${NGROK_BASE_URL}/api/scan`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData, 
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        topPrediction.value = result.data;
        showResult.value = true;
        
        if (route.query.taskId && userStore.isLoggedIn) {
           const taskId = parseInt(route.query.taskId);
           const verified = JSON.parse(localStorage.getItem(`verified_missions_${userStore.username}`) || '[]');
           if (!verified.includes(taskId)) {
               verified.push(taskId);
               localStorage.setItem(`verified_missions_${userStore.username}`, JSON.stringify(verified));
           }
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("連線到 AI 伺服器失敗，請確認你的 API 網址是否正確！");
    } finally {
      isUploading.value = false;
    }
  }, 'image/jpeg', 0.8);
};

const closeAndReturn = () => {
  showResult.value = false;
  if (route.query.taskId) { router.push('/mission'); }
};

const stopCamera = () => { if (stream) stream.getTracks().forEach(track => track.stop()); };

onUnmounted(() => { 
  stopCamera(); 
  document.body.classList.remove('hide-bottom-nav');
});
</script>

<style scoped>
.scan-page { position: fixed; inset: 0; background: black; z-index: 2000; overflow: hidden; display: flex; flex-direction: column; }
.camera-stream { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.camera-ui-overlay { position: relative; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; z-index: 10; pointer-events: none; }
.camera-ui-overlay * { pointer-events: auto; }
.close-scan { position: absolute; top: 30px; right: 25px; color: white; font-size: 24px; text-decoration: none; opacity: 0.8; z-index: 20;}
.scanner-frame { width: 260px; height: 260px; position: relative; box-shadow: 0 0 0 1000px rgba(0,0,0,0.5); border-radius: 24px; border: 2px solid transparent;}
.corner { position: absolute; width: 25px; height: 25px; border: 4px solid #10b981; }
.t-l { top: -2px; left: -2px; border-right: 0; border-bottom: 0; border-radius: 12px 0 0 0; }
.t-r { top: -2px; right: -2px; border-left: 0; border-bottom: 0; border-radius: 0 12px 0 0; }
.b-l { bottom: -2px; left: -2px; border-right: 0; border-top: 0; border-radius: 0 0 0 12px; }
.b-r { bottom: -2px; right: -2px; border-left: 0; border-top: 0; border-radius: 0 0 12px 0; }

.camera-footer { position: absolute; bottom: 80px; text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center;}
.instruction { color: rgba(255,255,255,0.8); margin-bottom: 25px; font-weight: 500; font-size: 14px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); padding: 0 20px;}
.shutter-btn { width: 72px; height: 72px; border-radius: 50%; border: 4px solid white; background: transparent; position: relative; transition: 0.2s;}
.shutter-btn::after { content: ''; position: absolute; inset: 5px; background: white; border-radius: 50%; transition: 0.2s; }
.shutter-btn:active { transform: scale(0.9); }
.shutter-btn:disabled::after { background: #9ca3af; }
.spinner-shutter { position: absolute; inset: 0; border: 4px solid rgba(255,255,255,0.3); border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; z-index: 5;}
@keyframes spin { 100% { transform: rotate(360deg); } }

.result-sheet { position: fixed; bottom: -100%; left: 0; width: 100%; background: white; border-radius: 28px 28px 0 0; transition: bottom 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); z-index: 99999;}
.result-sheet.active { bottom: 0; }
.sheet-handle { width: 40px; height: 4px; background: #e5e7eb; border-radius: 2px; margin: 12px auto; }
.result-body { padding: 0 24px 35px; }
.result-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
.res-icon { font-size: 32px; background: #ecfdf5; padding: 12px; border-radius: 16px; }
.confidence { font-size: 12px; color: #10b981; font-weight: 700; margin-bottom: 4px; }
.res-name { font-size: 20px; font-weight: 800; margin: 0; color: #111827; }

.res-desc-container { max-height: 40vh; overflow-y: auto; margin-bottom: 20px; padding-right: 5px; }
.res-desc { line-height: 1.7; color: #4b5563; font-size: 15px; margin: 0; }

.btn-group { display: flex; flex-direction: column; gap: 10px; }
.btn-learn { width: 100%; background: #111827; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: 700; font-size: 15px; text-align: center; text-decoration: none;}
.bg-success { background: #10b981 !important; color: white !important;}
</style>

<style>
body.hide-bottom-nav .bottom-nav {
  display: none !important;
}
</style>
