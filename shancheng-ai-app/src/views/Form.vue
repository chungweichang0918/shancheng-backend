<template>
  <div class="form-wrapper">
    <header class="header-nav">
      <router-link to="/" class="back-link">←</router-link>
      <h2 class="page-title">{{ t.title }}</h2>
    </header>
    <main class="main-content">
      <div class="container py-3">
        
        <section class="form-section">
          <h5 class="section-label">1. {{ t.q1 }}</h5>
          <div class="selection-grid">
            <div v-for="opt in t.audOpts" :key="opt.id">
              <input type="radio" :id="opt.id" :value="opt.label" v-model="selectedAudience" class="hidden-radio">
              <label :for="opt.id" class="selection-card">
                <span class="emoji">{{ opt.icon }}</span>
                <span class="label">{{ opt.label }}</span>
              </label>
            </div>
          </div>
        </section>

        <section class="form-section mt-3">
          <h5 class="section-label">2. {{ t.q2 }}</h5>
          <div class="selection-grid single-col">
            <div v-for="opt in t.durOpts" :key="opt.id">
              <input type="radio" :id="opt.id" :value="opt.label" v-model="selectedDuration" class="hidden-radio">
              <label :for="opt.id" class="selection-card wide-card">
                <span class="emoji">{{ opt.icon }}</span>
                <span class="label">{{ opt.label }}</span>
              </label>
            </div>
          </div>
        </section>

        <section class="form-section mt-3">
          <h5 class="section-label">3. {{ t.q3 }}</h5>
          <div class="selection-grid">
            <div v-for="opt in t.prefOpts" :key="opt.id">
              <input type="checkbox" :id="opt.id" :value="opt.label" v-model="selectedPreferences" class="hidden-radio">
              <label :for="opt.id" class="selection-card">
                <span class="emoji">{{ opt.icon }}</span>
                <span class="label">{{ opt.label }}</span>
              </label>
            </div>
          </div>
        </section>

        <section class="form-section mt-3">
          <h5 class="section-label">4. {{ t.q4 }}</h5>
          <div class="selection-grid single-col">
            <div v-for="opt in t.areaOpts" :key="opt.id">
              <input type="radio" :id="opt.id" :value="opt.label" v-model="selectedArea" class="hidden-radio">
              <label :for="opt.id" class="selection-card wide-card">
                <span class="emoji">{{ opt.icon }}</span>
                <span class="label">{{ opt.label }}</span>
              </label>
            </div>
          </div>
        </section>

        <section class="form-section mt-3">
          <h5 class="section-label">5. {{ t.q5 }}</h5>
          <div class="custom-note-box">
            <textarea v-model="customNote" class="custom-textarea" rows="4"></textarea>
          </div>
        </section>

        <div style="height: 100px;"></div>
      </div>
    </main>

    <footer v-if="canShowSubmit" class="footer-action shadow-lg">
      <button class="btn-ai-submit" @click="fetchAIRecommendation(false)" :disabled="isSubmitting">
        <span v-if="!isSubmitting">✨ {{ t.submit }}</span>
        <span v-else>⏳ {{ t.loading }}</span>
      </button>
    </footer>

    <div class="ai-result-overlay" :class="{ 'active': showResult }">
      <div class="overlay-backdrop" @click="closeResult"></div>
      <div class="result-card">
        <div class="result-content-wrap" v-if="!isRegenerating">
          <div class="result-header">
            <span class="result-icon">✨</span>
            <h3 class="result-title">{{ aiResultTitle }}</h3>
          </div>
          <div class="result-body">
            <div class="result-text" v-html="formattedAiResultText"></div>
          </div>
          <div class="result-footer">
            <button class="btn-regenerate" @click="fetchAIRecommendation(true)">🔄 {{ t.regenerate }}</button>
            <button class="btn-confirm" @click="closeResult">{{ t.ok }}</button>
          </div>
        </div>
        <div v-else class="loading-state py-5 text-center">
          <div class="spinner-border text-success mb-2"></div>
          <p>{{ t.loading }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// 🌟 統一從 config.js 引入後端 API 網址
import { NGROK_BASE_URL } from './config';

const sysLang = ref(localStorage.getItem('shancheng_sys_lang') || 'zh');
const t = computed(() => {
  const dict = {
    zh: { 
      title: '規劃專屬行程', q1: '誰與您同行？', q2: '預計停留時間？', q3: '興趣偏好', q4: '想探索的區域', q5: '其他想交代的', submit: 'AI 開始規劃專屬行程', loading: '串接 AI 運算中...', regenerate: '重新規劃', ok: '完成', resultTitle: '✨ 行程提案',
      audOpts: [{id:'a1',icon:'👨‍👩‍👧',label:'親子'},{id:'a2',icon:'👩‍❤️‍👨',label:'情侶'},{id:'a3',icon:'🧓',label:'銀髮族'},{id:'a4',icon:'🧑‍🤝‍🧑',label:'好友'}],
      durOpts: [{id:'d1',icon:'🌤️',label:'半日遊'},{id:'d2',icon:'☀️',label:'一日遊'}],
      prefOpts: [{id:'p1',icon:'🌿',label:'生態探索'},{id:'p2',icon:'🍲',label:'美食旅遊'},{id:'p3',icon:'📷',label:'攝影景點'},{id:'p4',icon:'🌲',label:'森林步道'}],
      areaOpts: [{id:'r1',icon:'🎋',label:'鹿谷鄉｜小半天'},{id:'r2',icon:'🍵',label:'魚池鄉｜大雁'},{id:'r3',icon:'☕',label:'國姓鄉｜糯米橋'}]
    },
    en: { 
      title: 'Plan Trip', q1: 'Who is with you?', q2: 'Duration?', q3: 'Preferences', q4: 'Area to Explore', q5: 'Additional Notes', submit: 'Start AI Planning', loading: 'AI is thinking...', regenerate: 'Regenerate', ok: 'OK', resultTitle: '✨ Trip Proposal',
      audOpts: [{id:'a1',icon:'👨‍👩‍👧',label:'Family'},{id:'a2',icon:'👩‍❤️‍👨',label:'Couple'},{id:'a3',icon:'🧓',label:'Seniors'},{id:'a4',icon:'🧑‍🤝‍🧑',label:'Friends'}],
      durOpts: [{id:'d1',icon:'🌤️',label:'Half Day'},{id:'d2',icon:'☀️',label:'Full Day'}],
      prefOpts: [{id:'p1',icon:'🌿',label:'Eco Tour'},{id:'p2',icon:'🍲',label:'Food'},{id:'p3',icon:'📷',label:'Photography'},{id:'p4',icon:'🌲',label:'Forest Trail'}],
      areaOpts: [{id:'r1',icon:'🎋',label:'Lugu Township'},{id:'r2',icon:'🍵',label:'Yuchi Township'},{id:'r3',icon:'☕',label:'Guoshing Township'}]
    },
    ja: { 
      title: '旅行を計画', q1: '同行者は？', q2: '滞在時間？', q3: '好み', q4: '探索エリア', q5: 'その他の要望', submit: 'AI プラン生成', loading: 'AI 計算中...', regenerate: '再生成する', ok: '完了', resultTitle: '✨ 旅行プラン提案',
      audOpts: [{id:'a1',icon:'👨‍👩‍👧',label:'家族'},{id:'a2',icon:'👩‍❤️‍👨',label:'カップル'},{id:'a3',icon:'🧓',label:'シニア'},{id:'a4',icon:'🧑‍🤝‍🧑',label:'友人'}],
      durOpts: [{id:'d1',icon:'🌤️',label:'半日'},{id:'d2',icon:'☀️',label:'一日'}],
      prefOpts: [{id:'p1',icon:'🌿',label:'エコツアー'},{id:'p2',icon:'🍲',label:'グルメ'},{id:'p3',icon:'📷',label:'写真撮影'},{id:'p4',icon:'🌲',label:'森林コース'}],
      areaOpts: [{id:'r1',icon:'🎋',label:'鹿谷郷'},{id:'r2',icon:'🍵',label:'魚池郷'},{id:'r3',icon:'☕',label:'国姓郷'}]
    },
    ko: { 
      title: '여행 계획', q1: '동행인?', q2: '체류 시간?', q3: '관심사', q4: '탐색할 지역', q5: '추가 요청사항', submit: 'AI 계획 시작', loading: 'AI 연산 중...', regenerate: '다시 계획하기', ok: '확인', resultTitle: '✨ 여행 추천 일정',
      audOpts: [{id:'a1',icon:'👨‍👩‍👧',label:'가족'},{id:'a2',icon:'👩‍❤️‍👨',label:'커플'},{id:'a3',icon:'🧓',label:'시니어'},{id:'a4',icon:'🧑‍🤝‍🧑',label:'친구'}],
      durOpts: [{id:'d1',icon:'🌤️',label:'반일'},{id:'d2',icon:'☀️',label:'하루'}],
      prefOpts: [{id:'p1',icon:'🌿',label:'에코 투어'},{id:'p2',icon:'🍲',label:'음식'},{id:'p3',icon:'📷',label:'사진'},{id:'p4',icon:'🌲',label:'산림 산책'}],
      areaOpts: [{id:'r1',icon:'🎋',label:'루구향'},{id:'r2',icon:'🍵',label:'위츠향'},{id:'r3',icon:'☕',label:'궈싱향'}]
    }
  }; 
  return dict[sysLang.value] || dict.zh;
});

const selectedAudience = ref(''); 
const selectedDuration = ref(''); 
const selectedPreferences = ref([]); 
const selectedArea = ref(''); 
const customNote = ref('');

const canShowSubmit = computed(() => selectedPreferences.value.length > 0 || customNote.value.trim().length > 0);
const isSubmitting = ref(false); 
const isRegenerating = ref(false); 
const showResult = ref(false); 
const aiResultTitle = ref(''); 
const aiResultText = ref('');

const formattedAiResultText = computed(() => {
  let text = aiResultText.value;
  text = text.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');
  text = text.replace(/(?<!href=")(https?:\/\/(?:www\.)?google\.com\/(?:maps|dir)[^\s<]+)/g, '<br><a href="$1" target="_blank" class="map-route-btn">🗺️ Route Map</a>');
  text = text.replace(/\n/g, '<br>').replace(/- \*\*([^\*]+)\*\*/g, '<br><span class="time-badge">🕒 $1</span>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return text;
});

onMounted(() => { 
  userStore.restoreSession(); 
  if (!userStore.isLoggedIn) router.push('/'); 
  
  // 自動根據語言設定預設值
  const defaultOpts = t.value;
  selectedAudience.value = defaultOpts.audOpts[0].label;
  selectedDuration.value = defaultOpts.durOpts[1].label;
  selectedArea.value = defaultOpts.areaOpts[1].label;
});

const fetchAIRecommendation = async (isRetry = false) => {
  isRetry ? (isRegenerating.value = true) : (isSubmitting.value = true);
  
  // 🌟 終極防呆指令：強制 AI 使用選擇的系統語言，不准用中文！
  const langNames = { zh: "繁體中文", en: "English", ja: "日本語 (Japanese)", ko: "한국어 (Korean)" };
  const targetLang = langNames[sysLang.value] || "繁體中文";
  const forceLangInstruction = `\n\n⚠️ [CRITICAL INSTRUCTION] You MUST generate the ENTIRE trip proposal, including all titles, body text, and any descriptions, EXCLUSIVELY in ${targetLang}. DO NOT output Chinese unless the requested language is Chinese.`;
  
  const finalNote = customNote.value + forceLangInstruction;

  try {
    const response = await fetch(`${NGROK_BASE_URL}/api/recommend`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, 
      body: JSON.stringify({ 
        audience: selectedAudience.value, 
        duration: selectedDuration.value, 
        preferences: selectedPreferences.value, 
        area: selectedArea.value, 
        custom_note: finalNote, 
        language: targetLang,
        is_retry: isRetry 
      }) 
    });
    const result = await response.json();
    if (result.status === "success") { 
      // 🌟 用前端的多國語言標題，覆蓋後端寫死的中文
      aiResultTitle.value = t.value.resultTitle; 
      aiResultText.value = result.data.preview; 
      showResult.value = true; 
    } 
  } catch (e) {
    alert("連線失敗，請檢查網路狀態或伺服器是否開啟。");
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
.form-wrapper { position: fixed; inset: 0; display: flex; flex-direction: column; background: #f4f7f9; overflow: hidden; z-index: 10; text-align: left; }
.header-nav { background: white; padding: 15px 20px; display: flex; align-items: center; gap: 15px; flex-shrink: 0; }
.main-content { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding-bottom: 160px; }
.footer-action { position: fixed; bottom: 70px; left: 0; width: 100%; background: white; padding: 15px 20px; border-top: 1px solid #eee; z-index: 1000; box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.03); }
.back-link { font-size: 24px; color: #000; text-decoration: none; font-weight: bold; }
.page-title { font-size: 19px; font-weight: 800; margin: 0; }
.form-section { background: white; border-radius: 15px; padding: 18px; margin: 0 10px 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
.section-label { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 12px; }
.selection-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.selection-grid.single-col { grid-template-columns: 1fr; }
.hidden-radio { position: absolute; opacity: 0; }
.selection-card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: flex-start; gap: 10px; background: white; cursor: pointer; transition: 0.2s; }
.hidden-radio:checked + .selection-card { border-color: #10b981; background: #f0fdf4; }
.label { font-size: 14px; font-weight: 600; color: #333; }
.custom-note-box { border: 2px solid #10b981; border-radius: 12px; overflow: hidden; }
.custom-textarea { width: 100%; border: none; padding: 12px; font-size: 14px; outline: none; resize: none; }
.btn-ai-submit { width: 100%; background: #44a57a; color: white; border: none; padding: 15px; border-radius: 50px; font-size: 16px; font-weight: 700; }
.ai-result-overlay { position: fixed; inset: 0; z-index: 9999; display: none; }
.ai-result-overlay.active { display: flex; flex-direction: column; justify-content: flex-end; }
.overlay-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
.result-card { position: relative; background: white; border-radius: 25px 25px 0 0; padding: 25px; padding-bottom: 100px; max-height: 85vh; overflow-y: auto; }

/* 按鈕區域並排排版 */
.result-footer { display: flex; gap: 10px; margin-top: 5px; }
.btn-regenerate { flex: 1; background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 14px; border-radius: 12px; font-weight: 700; margin-bottom: 10px; transition: 0.2s; }
.btn-regenerate:active { transform: scale(0.98); background: #e2e8f0; }
.btn-confirm { flex: 1; background: #111; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; margin-bottom: 10px; transition: 0.2s; }
.btn-confirm:active { transform: scale(0.98); }

.result-text { font-size: 15px; color: #444; line-height: 1.8; margin-bottom: 25px; word-wrap: break-word; }
:deep(.time-badge) { display: inline-block; background-color: #f0fdf4; color: #059669; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 13px; margin-right: 6px; margin-top: 10px; }
:deep(.map-route-btn) { display: block; background-color: #3b82f6; color: white !important; text-align: center; padding: 12px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 700; margin-top: 20px; }
</style>
