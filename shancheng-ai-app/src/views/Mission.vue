<template>
  <div class="mission-page">
    <div class="top-nav shadow-sm d-flex align-items-center position-relative">
      <router-link to="/" class="back-link text-decoration-none text-dark fs-3 fw-bold position-absolute" style="left: 20px; z-index: 10;">
        ←
      </router-link>
      <h5 class="fw-bold m-0 text-center w-100">{{ t.pageTitle }}</h5>
    </div>

    <div class="container py-4">
      <div class="points-card shadow-lg" :class="currentLevel.themeClass">
        <div class="card-inner">
          <div class="points-header">{{ t.pointsTitle }}</div>
          <div class="points-value">
            {{ displayPoints }} <span class="unit">pt</span>
          </div>
          <div class="level-tag">✨ {{ currentLevel.name[sysLang] || currentLevel.name.zh }}</div>
        </div>
        
        <div class="progress-bar-wrap">
          <div v-if="canUpgrade" class="upgrade-prompt">
            <span class="upgrade-text animate-flicker">{{ t.readyUpgrade }}</span>
            <button class="btn-upgrade shadow" @click="doUpgrade" :disabled="isSyncing">
              {{ isSyncing ? t.syncing : t.btnUpgrade }}
            </button>
          </div>
          <div v-else class="progress-info">
            {{ t.nextLevel }} {{ pointsToNextLevel }} pt
          </div>
          
          <div class="bar-bg">
            <div class="bar-fill" :style="{ width: levelProgressWidth + '%' }"></div>
          </div>
        </div>
      </div>

      <h6 class="section-title d-flex justify-content-between align-items-center">
        <span>
          {{ t.todayTasks }} 
          <span class="badge rounded-pill bg-light text-dark fw-normal ms-1" style="font-size: 10px;">{{ t.gpsSecure }}</span>
        </span>
        <button class="btn-refresh" @click="refreshMissions">🔄 {{ t.refresh }}</button>
      </h6>
      
      <div v-if="missions.length === 0" class="text-center text-muted my-5 py-4">
        <div class="fs-1 mb-2">🎉</div>
        <div>{{ t.allDoneMsg }}</div>
      </div>

      <div class="mission-list">
        <div v-for="(m, index) in missions" :key="m.id" class="mission-tile shadow-sm animate-in">
          <div class="tile-icon" :class="{ done: m.complete }">{{ m.icon }}</div>
          <div class="tile-info">
            <div class="mission-name">{{ m.title[sysLang] || m.title.zh }}</div>
            <div class="mission-progress-text">{{ t.progressLabel }} {{ m.complete ? t.verified : t.notVerified }}</div>
            <div class="bar-bg mini"><div class="bar-fill" :style="{ width: m.percent + '%' }"></div></div>
          </div>
          
          <button 
            v-if="m.complete"
            class="btn-claim" 
            :disabled="isSyncing"
            @click="claimReward(index, m)"
          >
            {{ isSyncing ? '...' : t.claim }}
          </button>

          <button 
            v-else
            class="btn-verify" 
            @click="verifyTask(m)"
          >
            <i class="fa-solid fa-shield-halved me-1"></i> {{ t.goCheck }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const isSyncing = ref(false);
const displayPoints = ref(0);

// 🌟 統一從 config.js 引入後端 API 網址
import { NGROK_BASE_URL } from './config';
const API_HEADERS = { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" };

// 🌟 四國語言字典 (包含所有提示與警告文字)
const sysLang = ref(localStorage.getItem('shancheng_sys_lang') || 'zh');
const t = computed(() => {
  const dict = {
    zh: {
      pageTitle: '我的綠色成就', pointsTitle: '累積綠色點數', readyUpgrade: '已達到升級標準！', btnUpgrade: '🚀 點擊升級', nextLevel: '距離下一級還差', 
      todayTasks: '挑戰任務', gpsSecure: '雙重驗證啟動中', refresh: '更新', allDoneMsg: '太棒了！您已完成所有任務！', progressLabel: '進度：', 
      verified: '已完成驗證', notVerified: '0 / 1 次', claim: '領取', goCheck: '前往打卡', syncing: '同步中...',
      alertGPSReq: '📍 即將進行【雙重驗證】\n第一階段：GPS 定位檢查...\n請允許瀏覽器存取您的位置。',
      alertGPSPass: '✅ GPS 驗證通過！您目前距離任務點約 {dist} 公尺。\n\n📸 即將進入第二階段：開啟相機進行 AI 辨識！',
      alertGPSFail: '❌ 雙重防護阻擋：打卡失敗！\n您目前距離目標地點還有 {dist} 公里。\n請親自前往當地後，系統才會解鎖相機進行驗證！',
      alertGPSError: '❌ 無法獲取定位，請確認手機的 GPS 權限已開啟！', alertNoGPS: '您的瀏覽器不支援 GPS 定位功能。'
    },
    en: {
      pageTitle: 'My Green Achievements', pointsTitle: 'Green Points', readyUpgrade: 'Ready to Level Up!', btnUpgrade: '🚀 Level Up', nextLevel: 'Points to next level:', 
      todayTasks: 'Missions', gpsSecure: 'GPS SECURE', refresh: 'Refresh', allDoneMsg: 'Awesome! You have completed all missions!', progressLabel: 'Progress:', 
      verified: 'Verified', notVerified: '0 / 1', claim: 'Claim', goCheck: 'Check-in', syncing: 'Syncing...',
      alertGPSReq: '📍 [Dual Verification] Stage 1: GPS Check...\nPlease allow location access.',
      alertGPSPass: '✅ GPS Verified! You are {dist}m away.\n\n📸 Launching AI Camera for Stage 2!',
      alertGPSFail: '❌ Anti-cheat: Check-in failed!\nYou are {dist}km away.\nPlease visit the location to unlock the AI Camera!',
      alertGPSError: '❌ Cannot get location. Please enable GPS permissions!', alertNoGPS: 'Browser does not support GPS.'
    },
    ja: {
      pageTitle: '私のグリーン達成', pointsTitle: 'グリーンポイント', readyUpgrade: 'アップグレード可能！', btnUpgrade: '🚀 アップグレード', nextLevel: '次のレベルまで：', 
      todayTasks: 'タスク', gpsSecure: 'GPS 保護中', refresh: '更新', allDoneMsg: '素晴らしい！全タスク完了！', progressLabel: '進捗：', 
      verified: '検証済み', notVerified: '0 / 1 回', claim: '受け取る', goCheck: 'チェックイン', syncing: '同期中...',
      alertGPSReq: '📍 【二段階認証】第1段階：GPSチェック...\n位置情報のアクセスを許可してください。',
      alertGPSPass: '✅ GPS認証成功！目的地まで約 {dist}m。\n\n📸 第2段階のAIカメラを起動します！',
      alertGPSFail: '❌ 不正防止：チェックイン失敗！\n目的地まで {dist}km 離れています。\n現地に到着後、カメラがロック解除されます。',
      alertGPSError: '❌ 位置情報が取得できません。GPSをオンにしてください！', alertNoGPS: 'ブラウザがGPSをサポートしていません。'
    },
    ko: {
      pageTitle: '나의 그린 업적', pointsTitle: '누적 그린 포인트', readyUpgrade: '레벨업 가능!', btnUpgrade: '🚀 레벨업', nextLevel: '다음 레벨까지:', 
      todayTasks: '미션', gpsSecure: 'GPS 보안', refresh: '새로고침', allDoneMsg: '멋져요! 모든 미션을 완료했습니다!', progressLabel: '진행도:', 
      verified: '인증 완료', notVerified: '0 / 1 회', claim: '수령', goCheck: '체크인', syncing: '동기화 중...',
      alertGPSReq: '📍 [이중 인증] 1단계: GPS 확인 중...\n위치 접근을 허용해 주세요.',
      alertGPSPass: '✅ GPS 인증 완료! 목적지까지 약 {dist}m 남았습니다.\n\n📸 2단계 AI 카메라를 실행합니다!',
      alertGPSFail: '❌ 부정 방지: 체크인 실패!\n목적지에서 {dist}km 떨어져 있습니다.\n현장에 도착해야 카메라가 잠금 해제됩니다!',
      alertGPSError: '❌ 위치를 가져올 수 없습니다. GPS 권한을 확인하세요!', alertNoGPS: '브라우저가 GPS를 지원하지 않습니다.'
    }
  };
  return dict[sysLang.value] || dict.zh;
});

const levels = [
  { name: { zh: '初階山城旅人', en: 'Beginner Traveler', ja: '初心者トラベラー', ko: '초보 여행자' }, target: 500, themeClass: 'theme-beginner' },
  { name: { zh: '中階山城旅人', en: 'Intermediate Traveler', ja: '中級トラベラー', ko: '중급 여행자' }, target: 1500, themeClass: 'theme-intermediate' },
  { name: { zh: '高階永續大使', en: 'Advanced Ambassador', ja: '上級アンバサダー', ko: '고급 앰배서더' }, target: 3000, themeClass: 'theme-advanced' }
];

const currentLevelIndex = ref(0);
const currentLevel = computed(() => levels[currentLevelIndex.value]);

const canUpgrade = computed(() => {
  const isMaxLevel = currentLevelIndex.value >= levels.length - 1;
  return !isMaxLevel && (userStore.greenPoints >= currentLevel.value.target);
});
const pointsToNextLevel = computed(() => Math.max(0, currentLevel.value.target - userStore.greenPoints));
const levelProgressWidth = computed(() => {
  const currentPts = userStore.greenPoints || 0;
  if (currentPts >= currentLevel.value.target) return 100;
  const prevTarget = currentLevelIndex.value === 0 ? 0 : levels[currentLevelIndex.value - 1].target;
  const range = currentLevel.value.target - prevTarget;
  return Math.max(0, ((currentPts - prevTarget) / range) * 100);
});

const getClaimedMissions = () => JSON.parse(localStorage.getItem(`claimed_missions_${userStore.username}`) || '[]');
const getVerifiedMissions = () => JSON.parse(localStorage.getItem(`verified_missions_${userStore.username}`) || '[]');
const saveClaimedMission = (id) => { const claimed = getClaimedMissions(); claimed.push(id); localStorage.setItem(`claimed_missions_${userStore.username}`, JSON.stringify(claimed)); };

// 🌟 擴充至 30 個任務，並加上四國語言標題 (座標設定為南投各大鄉鎮)
const allMissions = [
  { id: 1, icon: '📷', targetLat: 23.6826, targetLng: 120.7663, radius: 5000, rewardPoints: 80, title: { zh: '【鹿谷】大崙山銀杏圖鑑', en: '[Lugu] Ginkgo Pokedex', ja: '【鹿谷】銀杏の森図鑑', ko: '[루구] 은행나무 도감' } },
  { id: 2, icon: '🍵', targetLat: 23.6934, targetLng: 120.7561, radius: 5000, rewardPoints: 50, title: { zh: '【鹿谷】品嚐在地竹筒飯', en: '[Lugu] Eat Bamboo Rice', ja: '【鹿谷】竹筒飯を味わう', ko: '[루구] 대통밥 맛보기' } },
  { id: 3, icon: '🚶', targetLat: 23.9015, targetLng: 120.9238, radius: 5000, rewardPoints: 120, title: { zh: '【魚池】澀水森林步道探險', en: '[Yuchi] Seshui Trail Hike', ja: '【魚池】渋水森林歩道探索', ko: '[위츠] 써수이 숲길 탐험' } },
  { id: 4, icon: '☕', targetLat: 23.8828, targetLng: 120.9248, radius: 5000, rewardPoints: 60, title: { zh: '【魚池】環保杯買日月潭紅茶', en: '[Yuchi] Eco-cup Black Tea', ja: '【魚池】マイボトルで紅茶購入', ko: '[위츠] 텀블러로 홍차 구매' } },
  { id: 5, icon: '🌉', targetLat: 24.0583, targetLng: 120.9022, radius: 5000, rewardPoints: 70, title: { zh: '【國姓】抵達三級古蹟糯米橋', en: '[Guoshing] Nuomi Bridge', ja: '【国姓】糯米橋に到着', ko: '[궈싱] 눠미차오 도착' } },
  { id: 6, icon: '☕', targetLat: 24.0435, targetLng: 120.8546, radius: 5000, rewardPoints: 90, title: { zh: '【國姓】在地精品咖啡手沖', en: '[Guoshing] Local Coffee', ja: '【国姓】地元コーヒー体験', ko: '[궈싱] 현지 커피 체험' } },
  { id: 7, icon: '🌲', targetLat: 23.9037, targetLng: 120.6900, radius: 5000, rewardPoints: 200, title: { zh: '【南投】參與永續植樹活動', en: '[Nantou] Tree Planting', ja: '【南投】植樹活動に参加', ko: '[난터우] 나무 심기 참여' } },
  { id: 8, icon: '♻️', targetLat: 23.8325, targetLng: 120.9081, radius: 5000, rewardPoints: 100, title: { zh: '【山林】資源回收環保任務', en: '[Forest] Recycling Task', ja: '【山林】リサイクル活動', ko: '[산림] 재활용 미션' } },
  { id: 9, icon: '🍽️', targetLat: 23.8625, targetLng: 120.9081, radius: 5000, rewardPoints: 80, title: { zh: '【休農區】品嚐低碳蔬食', en: '[Agri-zone] Low Carbon Meal', ja: '【農園】低炭素ベジミール', ko: '[농장] 저탄소 채식 식사' } },
  { id: 10, icon: '🚲', targetLat: 23.8625, targetLng: 120.9081, radius: 5000, rewardPoints: 150, title: { zh: '【日月潭】低碳自行車探索', en: '[SML] Eco Bike Tour', ja: '【日月潭】エコサイクリング', ko: '[일월담] 에코 자전거 탐험' } },
  { id: 11, icon: '🌸', targetLat: 23.8631, targetLng: 120.9281, radius: 5000, rewardPoints: 90, title: { zh: '【九族】櫻花季生態攝影', en: '[FACA] Cherry Blossom Photo', ja: '【九族】桜シーズンの撮影', ko: '[구족] 벚꽃 사진 촬영' } },
  { id: 12, icon: '🐸', targetLat: 23.9312, targetLng: 120.9254, radius: 5000, rewardPoints: 110, title: { zh: '【桃米】紙教堂生態尋寶', en: '[Taomi] Paper Dome Quest', ja: '【桃米】紙の教会の生態探し', ko: '[타오미] 종이교회 생태 탐험' } },
  { id: 13, icon: '⛰️', targetLat: 24.0433, targetLng: 121.1566, radius: 5000, rewardPoints: 140, title: { zh: '【清境】高山農場步道行', en: '[Qingjing] Farm Trail Walk', ja: '【清境】高山農場ハイキング', ko: '[칭징] 고산 농장 트레킹' } },
  { id: 14, icon: '🐑', targetLat: 24.0567, targetLng: 121.1623, radius: 5000, rewardPoints: 60, title: { zh: '【清境】不用塑膠袋餵羊', en: '[Qingjing] Eco Sheep Feeding', ja: '【清境】エコな羊の餌やり', ko: '[칭징] 에코 양 먹이주기' } },
  { id: 15, icon: '💧', targetLat: 23.9612, targetLng: 120.9634, radius: 5000, rewardPoints: 70, title: { zh: '【埔里】地理中心碑打卡', en: '[Puli] Center of Taiwan', ja: '【埔里】台湾地理中心碑', ko: '[푸리] 대만 지리 중심비' } },
  { id: 16, icon: '🏺', targetLat: 23.8211, targetLng: 120.7854, radius: 5000, rewardPoints: 100, title: { zh: '【集集】綠色隧道自行車', en: '[Jiji] Green Tunnel Bike', ja: '【集集】緑のトンネル自転車', ko: '[지지] 녹색 터널 자전거' } },
  { id: 17, icon: '🚂', targetLat: 23.8256, targetLng: 120.7891, radius: 5000, rewardPoints: 80, title: { zh: '【集集】火車站古蹟巡禮', en: '[Jiji] Station Heritage', ja: '【集集】駅の歴史巡り', ko: '[지지] 기차역 유적 탐방' } },
  { id: 18, icon: '🐒', targetLat: 23.8322, targetLng: 120.7911, radius: 5000, rewardPoints: 130, title: { zh: '【特生】保育中心生態學習', en: '[ESRI] Eco Learning Center', ja: '【特生】生態保育学習', ko: '[특생] 생태 보육 학습' } },
  { id: 19, icon: '🌌', targetLat: 24.1234, targetLng: 121.2821, radius: 5000, rewardPoints: 250, title: { zh: '【合歡山】無光害星空觀賞', en: '[Hehuan] Dark Sky Stargazing', ja: '【合歓山】星空観賞', ko: '[허환산] 밤하늘 별 관측' } },
  { id: 20, icon: '🥾', targetLat: 24.1352, targetLng: 121.2721, radius: 5000, rewardPoints: 180, title: { zh: '【合歡山】無痕山林淨山', en: '[Hehuan] Leave No Trace', ja: '【合歓山】エコな登山', ko: '[허환산] 흔적 남기지 않기' } },
  { id: 21, icon: '🍎', targetLat: 24.2341, targetLng: 121.2561, radius: 5000, rewardPoints: 90, title: { zh: '【梨山】在地小農蘋果採購', en: '[Lishan] Local Apples', ja: '【梨山】地元農家のりんご', ko: '[리산] 현지 사과 구매' } },
  { id: 22, icon: '🍵', targetLat: 23.8234, targetLng: 120.6212, radius: 5000, rewardPoints: 85, title: { zh: '【名間】松柏嶺茶園走讀', en: '[Mingjian] Tea Garden Walk', ja: '【名間】茶園ウォーキング', ko: '[밍지엔] 다원 산책' } },
  { id: 23, icon: '🐒', targetLat: 23.8112, targetLng: 120.6152, radius: 5000, rewardPoints: 110, title: { zh: '【名間】受天宮生態觀察', en: '[Mingjian] Temple Ecology', ja: '【名間】受天宮の生態観察', ko: '[밍지엔] 사원 생태 관찰' } },
  { id: 24, icon: '🌲', targetLat: 23.6331, targetLng: 120.7963, radius: 5000, rewardPoints: 160, title: { zh: '【溪頭】神木步道芬多精', en: '[Xitou] Sacred Tree Trail', ja: '【渓頭】神木歩道で森林浴', ko: '[시터우] 신목 길 산림욕' } },
  { id: 25, icon: '🦉', targetLat: 23.6421, targetLng: 120.7912, radius: 5000, rewardPoints: 125, title: { zh: '【溪頭】大學池夜間導覽', en: '[Xitou] University Pond Night', ja: '【渓頭】大学池の夜間ガイド', ko: '[시터우] 대학 연못 야간 투어' } },
  { id: 26, icon: '🪵', targetLat: 23.7121, targetLng: 120.8523, radius: 5000, rewardPoints: 145, title: { zh: '【水里】車埕木業展示館', en: '[Shuili] Checheng Wood', ja: '【水里】車埕木業展示館', ko: '[수이리] 처청 목업 전시관' } },
  { id: 27, icon: '🍱', targetLat: 23.7155, targetLng: 120.8566, radius: 5000, rewardPoints: 75, title: { zh: '【車埕】品嚐鐵道木桶便當', en: '[Checheng] Wooden Bento', ja: '【車埕】鉄道木桶弁当', ko: '[처청] 철도 나무 도시락' } },
  { id: 28, icon: '🛶', targetLat: 23.8611, targetLng: 120.9122, radius: 5000, rewardPoints: 170, title: { zh: '【日月潭】無動力SUP立槳', en: '[SML] Eco SUP Boarding', ja: '【日月潭】エコSUP体験', ko: '[일월담] 에코 SUP 체험' } },
  { id: 29, icon: '🦋', targetLat: 23.9421, targetLng: 120.9321, radius: 5000, rewardPoints: 95, title: { zh: '【埔里】蝴蝶復育園區', en: '[Puli] Butterfly Conservation', ja: '【埔里】蝶の保護区', ko: '[푸리] 나비 보존 구역' } },
  { id: 30, icon: '🍷', targetLat: 23.9531, targetLng: 120.9521, radius: 5000, rewardPoints: 85, title: { zh: '【埔里】酒廠在地消費', en: '[Puli] Winery Local Buy', ja: '【埔里】酒造で地元消費', ko: '[푸리] 주조 현지 소비' } }
];

const missions = ref([]);
const backupMissions = ref([]);

// 🌟 隨機洗牌演算法
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// 🌟 載入與分配任務
const initMissions = (forceShuffle = false) => {
  const claimed = getClaimedMissions();
  const verified = getVerifiedMissions();
  
  let available = allMissions.filter(m => !claimed.includes(m.id)).map(m => {
    const isDone = verified.includes(m.id);
    return { ...m, complete: isDone, percent: isDone ? 100 : 0 };
  });

  if (forceShuffle) {
    available = shuffleArray(available);
  }

  missions.value = available.slice(0, 5);
  backupMissions.value = available.slice(5);
};

// 🌟 點擊更新按鈕：重新隨機洗牌抽出 5 個
const refreshMissions = () => {
  initMissions(true);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
};

// 🌟 GPS 雙重驗證 (結合多國語言提示)
const verifyTask = (mission) => {
  alert(t.value.alertGPSReq);
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distanceMeters = calculateDistance(userLat, userLng, mission.targetLat, mission.targetLng);
        
        if (distanceMeters <= mission.radius) {
            alert(t.value.alertGPSPass.replace('{dist}', Math.round(distanceMeters)));
            router.push(`/scan?taskId=${mission.id}`);
        } else {
            const distanceKm = (distanceMeters / 1000).toFixed(1);
            alert(t.value.alertGPSFail.replace('{dist}', distanceKm));
        }
      },
      (error) => { alert(t.value.alertGPSError); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    alert(t.value.alertNoGPS);
  }
};

const syncDataToBackend = async () => {
  if (!userStore.isLoggedIn) return;
  isSyncing.value = true;
  try {
    await fetch(`${NGROK_BASE_URL}/api/sync`, {
      method: 'POST', headers: API_HEADERS,
      body: JSON.stringify({ username: userStore.username, score: userStore.greenPoints, level: currentLevelIndex.value })
    });
  } catch (err) {} 
  finally { isSyncing.value = false; }
};

const claimReward = async (index, mission) => {
  if (!mission.complete || isSyncing.value || !userStore.isLoggedIn) return;
  
  userStore.updateScore(userStore.greenPoints + mission.rewardPoints);
  saveClaimedMission(mission.id);

  missions.value.splice(index, 1);
  if (backupMissions.value.length > 0) {
    missions.value.push(backupMissions.value.shift());
  }
  await syncDataToBackend();
};

const doUpgrade = async () => {
  if (canUpgrade.value) {
    currentLevelIndex.value += 1;
    await syncDataToBackend();
  }
};

onMounted(() => {
  userStore.restoreSession();
  if (!userStore.isLoggedIn) {
    router.push('/');
    return;
  }
  initMissions(false);
  setTimeout(() => {
     if (userStore.greenPoints >= 1500) currentLevelIndex.value = 2;
     else if (userStore.greenPoints >= 500) currentLevelIndex.value = 1;
  }, 500);
});

watch(() => userStore.greenPoints, (newVal) => {
  const step = Math.ceil((newVal - displayPoints.value) / 10) || 1;
  const timer = setInterval(() => {
    if (displayPoints.value < newVal) {
      displayPoints.value += step;
      if (displayPoints.value > newVal) displayPoints.value = newVal;
    } else {
      clearInterval(timer);
    }
  }, 30);
}, { immediate: true });
</script>

<style scoped>
/* CSS 完全保留 */
.mission-page { background: #f1f5f9; min-height: 100vh; padding-bottom: 80px; }
.top-nav { background: white; padding: 18px; border-bottom: 1px solid #e2e8f0; }
.points-card { border-radius: 28px; padding: 32px 24px; color: white; position: relative; overflow: hidden; transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); margin-bottom: 20px;}
.theme-beginner { background: linear-gradient(135deg, #065f46 0%, #10b981 100%); }
.theme-intermediate { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); }
.theme-advanced { background: linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%); }
.points-header { font-size: 13px; opacity: 0.85; font-weight: 500; letter-spacing: 0.5px; }
.points-value { font-size: 48px; font-weight: 900; margin: 8px 0; font-family: 'Inter', sans-serif; }
.points-value .unit { font-size: 18px; opacity: 0.7; margin-left: 4px; }
.level-tag { background: rgba(255,255,255,0.25); backdrop-filter: blur(8px); display: inline-block; padding: 6px 14px; border-radius: 50px; font-size: 12px; font-weight: 600; }
.progress-bar-wrap { margin-top: 28px; }
.upgrade-prompt { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.upgrade-text { font-size: 12px; font-weight: 800; color: #fef08a; }
.animate-flicker { animation: flicker 2s infinite; }
.btn-upgrade { background: #facc15; color: #422006; border: none; padding: 6px 14px; border-radius: 50px; font-size: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(250, 204, 21, 0.4); }
.progress-info { font-size: 11px; margin-bottom: 8px; opacity: 0.9; font-weight: 500; }
.bar-bg { background: rgba(255,255,255,0.2); height: 10px; border-radius: 10px; overflow: hidden; }
.bar-fill { background: #bef264; height: 100%; border-radius: 10px; transition: width 0.8s ease-out; box-shadow: 0 0 10px rgba(190, 242, 100, 0.5); }
.section-title { font-size: 17px; font-weight: 800; color: #1e293b; margin: 32px 0 16px; padding-left: 4px; border-left: 4px solid #10b981; line-height: 1; }
.mission-tile { background: white; border-radius: 22px; padding: 20px; display: flex; align-items: center; gap: 16px; margin-bottom: 14px; border: 1px solid rgba(226, 232, 240, 0.8); transition: transform 0.2s; }
.mission-tile:active { transform: scale(0.98); }
.tile-icon { width: 52px; height: 52px; background: #f8fafc; border-radius: 16px; display: flex; justify-content: center; align-items: center; font-size: 22px; }
.tile-icon.done { background: #f0fdf4; border: 2px solid #22c55e; }
.mission-name { font-weight: 800; font-size: 16px; color: #0f172a; margin-bottom: 4px; }
.mission-progress-text { font-size: 12px; color: #64748b; margin: 6px 0; }
.bar-bg.mini { height: 6px; background: #f1f5f9; border-radius: 3px; }
.btn-claim { background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%); color: white; border: none; padding: 8px 18px; border-radius: 12px; font-size: 14px; font-weight: 800; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3); }
.btn-verify { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 12px; font-size: 13px; font-weight: 700; white-space: nowrap;}
.btn-verify:active { background: #e2e8f0; }
.btn-refresh { background: #e2e8f0; color: #334155; border: none; padding: 4px 10px; border-radius: 50px; font-size: 12px; font-weight: 700; transition: 0.2s; }
.btn-refresh:active { transform: scale(0.95); background: #cbd5e1; }
@keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
.animate-in { animation: slideIn 0.4s ease-out backwards; }
@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
