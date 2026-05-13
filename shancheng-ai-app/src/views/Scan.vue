<template>
  <div class="scan-page">
    <video ref="videoRef" autoplay playsinline muted class="camera-stream"></video>
    
    <div class="camera-ui-overlay">
      <router-link to="/" class="close-scan" @click="stopCamera">✕</router-link>
      
      <div class="scanner-frame" :class="{ 'analyzing': isAnalyzing }">
        <div class="corner t-l"></div><div class="corner t-r"></div>
        <div class="corner b-l"></div><div class="corner b-r"></div>
        
        <div v-if="isLoadingModel" class="model-loading-box">
          <div class="spinner-border text-light mb-2" role="status"></div>
          <p class="text-white small m-0">正在載入南投食農 AI 模型...</p>
        </div>
        
        <div class="scan-line" v-show="!isLoadingModel && isAnalyzing"></div>
      </div>

      <div class="camera-footer">
        <div v-if="topPrediction && isAnalyzing" class="realtime-result-label shadow">
          🔍 您拍的是：<strong class="text-success">{{ topPrediction.className }}</strong>
        </div>
        
        <div class="instruction">對準農作物或在地植物，AI 將自動辨識</div>
        
        <button class="shutter-btn" @click="handleShutterClick" :disabled="isLoadingModel || !isAnalyzing">
          <span v-if="isLoadingModel" class="spinner-shutter"></span>
        </button>
      </div>
    </div>

    <div class="result-sheet" :class="{ active: showResult }">
      <div class="sheet-handle"></div>
      <div class="result-body">
        <div v-if="topPrediction" class="result-content-wrap">
          <div class="result-header">
            <div class="res-icon">🍃</div>
            <div>
              <div class="confidence">南投在地辨識率 {{ (topPrediction.probability * 100).toFixed(1) }}%</div>
              <h3 class="res-name">{{ topPrediction.className }}</h3>
            </div>
          </div>
          <p class="res-desc">
            這是南投當地著名的農特產，具有獨特的冷香與甘甜味，是食農教育體驗中非常受歡迎的主角！
          </p>
          <div class="btn-group">
            <router-link class="btn-learn" to="/guide">📖 了解更多導覽 story</router-link>
            <button class="btn-stamp" @click="showResult = false">🏅 領取綠色成就 (集章)</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

// --- 一、 相機與 UI 控制變數 ---
const videoRef = ref(null);         // 綁定 Video 元素
const isLoadingModel = ref(true);  // 控制模型載入中狀態
const isAnalyzing = ref(true);     // 控制即時辨識迴圈
const showResult = ref(false);      // 控制結果卡片
const topPrediction = ref(null);  // 儲存辨識率最高的結果

// --- 二、 Teachable Machine (Edge AI) 核心邏輯 ---

// 我們先預載一個通用型植物辨識模型，供您 Demo。
// 💡 將來若要在競賽中展示「茶葉辨識」，您需要在這裡換成您訓練好的 TM 模型網址
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/S4xI1m2C9/"; 
let model;
let maxPredictions;
let webCam;
let animationId; // 用來記錄與取消 requestAnimationFrame

// 1. 初始化相機與載入模型
onMounted(async () => {
  // A. 請求相機權限並啟動 (使用 facingMode: 'environment' 指定後鏡頭)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    // 將相機串流塞入 Video 元素
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
  } catch (error) {
    console.error("相機存取失敗:", error);
    alert("掃描功能需要您的相機權限才能正常運作哦！");
    isLoadingModel.value = false;
    return;
  }

  // B. 載入機器學習模型
  try {
    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";
    
    // 從 TM 網址載入模型與其元數據
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    isLoadingModel.value = false;
    console.log("食農 AI 模型載入成功！");
    
    // C. 啟動即時辨識迴圈
    predictLoop();
  } catch (error) {
    console.error("模型載入失敗:", error);
    isLoadingModel.value = false;
    alert("模型載入失敗，可能發生網路問題，請重新整理試試！");
  }
});

// 2. 核心：即時辨識迴圈 (Edge AI 邊緣運算)
const predictLoop = async () => {
  // 如果正在顯示結果、或是模型未載入，就停止辨識以節省效能
  if (showResult.value || isLoadingModel.value || !model || !videoRef.value) {
    animationId = window.requestAnimationFrame(predictLoop);
    return; 
  }

  // 使用模型對當前的 Video 畫面進行預測
  const prediction = await model.predict(videoRef.value);
  
  // 3. 解析結果：找到辨識率最高的項目
  let highest = { className: "", probability: 0 };
  for (let i = 0; i < maxPredictions; i++) {
    // 門檻：機率大於 80% 且比當前的還高
    if (prediction[i].probability > 0.8 && prediction[i].probability > highest.probability) {
      highest = prediction[i];
    }
  }

  // 4. 更新畫面顯示的結果
  if (highest.probability > 0) {
    topPrediction.value = highest;
  } else {
    topPrediction.value = null; // 機率太低就顯示未辨識
  }

  // 繼續下一次辨識 (使用 requestAnimationFrame 讓效能最佳化)
  animationId = window.requestAnimationFrame(predictLoop);
};

// --- 三、 UI 互動邏輯 ---

// 按下快門鍵，顯示最終結果
const handleShutterClick = () => {
  if (topPrediction.value) {
    // 1. 顯示結果卡片
    showResult.value = true;
  } else {
    alert("尚未辨識出特定的農作物，請換一個角度試試！");
  }
};

// 停止相機的函數 (在離開頁面時呼叫)
const stopCamera = () => {
  // 1. 取消即時辨識迴圈，節省處理器資源
  if (animationId) {
    window.cancelAnimationFrame(animationId);
  }

  // 2. 找到相機串流的所有軌道並關閉它
  const stream = videoRef.value?.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    console.log("相機已關閉");
  }
};

// 在元件卸載前，務必把相機關閉 (重要 UX 細節)
onUnmounted(() => {
  stopCamera();
});
</script>

<style scoped>
.scan-page { position: fixed; inset: 0; background: black; z-index: 2000; overflow: hidden; display: flex; flex-direction: column; }

/* 🌟 真實 Video 串流，設定為鋪滿背景且維持比例 */
.camera-stream { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }

/* 🌟 UI 覆蓋層，設定為相對定位以覆蓋在 Video 之上 */
.camera-ui-overlay { position: relative; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; z-index: 10; pointer-events: none; }
.camera-ui-overlay * { pointer-events: auto; } /* 重新開啟子元素的點擊事件 */

.close-scan { position: absolute; top: 30px; right: 25px; color: white; font-size: 24px; text-decoration: none; opacity: 0.8; z-index: 20;}

/* 掃描框 (修正排版使其置中) */
.scanner-frame { width: 260px; height: 260px; position: relative; box-shadow: 0 0 0 1000px rgba(0,0,0,0.5); border-radius: 24px; transition: border-color 0.3s ease;}
.scanner-frame.analyzing { border-color: transparent;} /* 正常中 */

.corner { position: absolute; width: 25px; height: 25px; border: 4px solid #bef264; transition: 0.2s;}
.scanner-frame.analyzing .corner { border-color: #10b981; } /* 辨識成功中 */

.t-l { top: -2px; left: -2px; border-right: 0; border-bottom: 0; border-radius: 12px 0 0 0; }
.t-r { top: -2px; right: -2px; border-left: 0; border-bottom: 0; border-radius: 0 12px 0 0; }
.b-l { bottom: -2px; left: -2px; border-right: 0; border-top: 0; border-radius: 0 0 0 12px; }
.b-r { bottom: -2px; right: -2px; border-left: 0; border-top: 0; border-radius: 0 0 12px 0; }

.scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: #bef264; box-shadow: 0 0 15px #bef264; animation: scanning 3s infinite cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.6; }
@keyframes scanning { 0% { top: 0%; } 100% { top: 100%; } }

/* 模型載入提示 */
.model-loading-box { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); border-radius: 20px; text-align: center; padding: 20px;}

/* 底部區域 */
.camera-footer { position: absolute; bottom: 50px; text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center;}
.instruction { color: rgba(255,255,255,0.8); margin-bottom: 15px; font-weight: 500; font-size: 14px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }

/* 即時辨識結果標籤 (浮動感) */
.realtime-result-label { background: white; color: #111827; padding: 8px 18px; border-radius: 50px; font-weight: 700; font-size: 14px; margin-bottom: 15px; border-bottom: 3px solid #10b981; }

.shutter-btn { width: 72px; height: 72px; border-radius: 50%; border: 4px solid white; background: transparent; position: relative; transition: 0.2s;}
.shutter-btn::after { content: ''; position: absolute; inset: 5px; background: white; border-radius: 50%; transition: 0.2s; }
.shutter-btn:active { transform: scale(0.9); }
.shutter-btn:disabled::after { background: #9ca3af; }

.spinner-shutter { position: absolute; inset: 0; border: 4px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* 結果 Bottom Sheet (復用 Form.vue 的美化風格) */
.result-sheet { position: fixed; bottom: -100%; left: 0; width: 100%; background: white; border-radius: 28px 28px 0 0; transition: bottom 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); z-index: 2100;}
.result-sheet.active { bottom: 0; }
.sheet-handle { width: 40px; height: 4px; background: #e5e7eb; border-radius: 2px; margin: 12px auto; }
.result-body { padding: 0 24px 35px; }
.result-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
.res-icon { font-size: 32px; background: #ecfdf5; padding: 12px; border-radius: 16px; }
.confidence { font-size: 12px; color: #10b981; font-weight: 700; margin-bottom: 4px; }
.res-name { font-size: 20px; font-weight: 800; margin: 0; color: #111827; }
.res-desc { line-height: 1.7; color: #4b5563; font-size: 15px; margin-bottom: 25px; }
.btn-group { display: flex; flex-direction: column; gap: 10px; }
.btn-learn { width: 100%; background: #111827; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: 700; font-size: 15px; text-align: center; text-decoration: none;}
.btn-stamp { width: 100%; background: transparent; color: #10b981; border: 2px solid #10b981; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; }
</style>