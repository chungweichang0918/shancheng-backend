<template>
  <div class="settings-page">
    <div class="header-nav shadow-sm d-flex align-items-center position-relative">
      <router-link to="/" class="back-link text-decoration-none text-dark fs-3 fw-bold position-absolute" style="left: 20px; z-index: 10;">←</router-link>
      <h5 class="fw-bold m-0 text-center w-100">{{ t.sysSet }}</h5>
    </div>

    <div class="container py-4 pb-5 mb-5">
      <div class="profile-card shadow-sm">
        <div class="avatar-wrap">
          <img :src="`https://ui-avatars.com/api/?name=${userStore.username || 'Guest'}&background=10b981&color=fff&size=80`" class="avatar-img" alt="avatar" />
        </div>
        <div class="profile-info">
          <h4 class="user-name">{{ userStore.isLoggedIn ? userStore.username : t.visitor }}</h4>
          <div class="user-level" v-if="userStore.isLoggedIn">
            <span class="level-badge">{{ displayLevel.icon }} {{ displayLevel.name[sysLang] || displayLevel.name.zh }} ({{ userStore.greenPoints }}pt)</span>
          </div>
        </div>
        <button v-if="userStore.isLoggedIn" class="btn-edit-profile shadow-sm" :class="isEditing ? 'btn-success text-white' : 'btn-outline-secondary bg-white'" @click="toggleEdit">
          <i class="fa-solid me-1" :class="isEditing ? 'fa-check' : 'fa-pen'"></i>
          {{ isEditing ? t.saveBtn : t.editBtn }}
        </button>
      </div>

      <div class="settings-group shadow-sm" v-if="userStore.isLoggedIn">
        <div class="setting-item action-item text-primary fw-bold" @click="requestPasswordReset">
          <div class="setting-left">
            <div class="icon-box bg-blue-light"><i class="fa-solid fa-lock text-blue"></i></div>
            <span>{{ t.pwdChange }}</span>
          </div>
        </div>
        <div class="p-3 bg-light border-top" v-if="isResetting">
          <div class="mb-2">
            <input type="text" v-model="resetForm.otp" class="form-control form-control-sm mb-2 custom-input" :placeholder="t.otpHint" />
            <input type="password" v-model="resetForm.newPassword" class="form-control form-control-sm custom-input" :placeholder="t.newPwdHint" />
          </div>
          <button class="btn btn-success btn-sm w-100 fw-bold rounded-pill" @click="confirmPasswordReset" :disabled="isLoading">
            {{ isLoading ? t.processing : t.submitBtn }}
          </button>
        </div>
      </div>

      <h6 class="section-title">{{ t.pref }}</h6>
      <div class="settings-group shadow-sm">
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-green-light"><i class="fa-solid fa-utensils text-green"></i></div>
            <span class="setting-label">{{ t.diet }}</span>
          </div>
          <div class="setting-right">
            <select v-if="isEditing" v-model="editForm.diet" class="form-select form-select-sm border-success">
              <option v-for="(val, key) in t.dietOpts" :key="key" :value="key">{{ val }}</option>
            </select>
            <span v-else class="setting-value fw-bold text-dark">{{ translatePref('diet', userStore.dietPref) }}</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-blue-light"><i class="fa-solid fa-car text-blue"></i></div>
            <span class="setting-label">{{ t.travel }}</span>
          </div>
          <div class="setting-right">
            <select v-if="isEditing" v-model="editForm.travel" class="form-select form-select-sm border-success">
              <option v-for="(val, key) in t.travelOpts" :key="key" :value="key">{{ val }}</option>
            </select>
            <span v-else class="setting-value fw-bold text-dark">{{ translatePref('travel', userStore.travelPref) }}</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-purple-light"><i class="fa-solid fa-map-location-dot text-purple"></i></div>
            <span class="setting-label">{{ t.interest }}</span>
          </div>
          <div class="setting-right">
            <select v-if="isEditing" v-model="editForm.interest" class="form-select form-select-sm border-success">
              <option v-for="(val, key) in t.interestOpts" :key="key" :value="key">{{ val }}</option>
            </select>
            <span v-else class="setting-value fw-bold text-dark">{{ translatePref('interest', userStore.interestPref) }}</span>
          </div>
        </div>
      </div>

      <div class="text-center mb-4" v-if="isEditing">
        <button class="btn btn-success rounded-pill px-5 fw-bold shadow-sm" @click="saveProfile">
          <i class="fa-solid fa-floppy-disk me-2"></i> {{ t.save }}
        </button>
      </div>

      <h6 class="section-title">{{ t.appSet }}</h6>
      <div class="settings-group shadow-sm">
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-yellow-light"><i class="fa-solid fa-bell text-yellow"></i></div>
            <span class="setting-label">{{ t.push }}</span>
          </div>
          <div class="setting-right">
            <div class="form-check form-switch m-0">
              <input class="form-check-input custom-switch" type="checkbox" v-model="pushEnabled" @change="togglePush" />
            </div>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-gray-light"><i class="fa-solid fa-globe text-gray"></i></div>
            <span class="setting-label">{{ t.lang }}</span>
          </div>
          <div class="setting-right">
            <select v-if="currentVersion === 'v1.5.0'" v-model="systemLanguage" @change="changeLanguage" class="form-select form-select-sm border-secondary fw-bold text-dark" style="width: auto; cursor: pointer;">
              <option value="zh">🇹🇼 繁體中文</option>
              <option value="en">🇺🇸 English</option>
              <option value="ja">🇯🇵 日本語</option>
              <option value="ko">🇰🇷 한국어</option>
            </select>
            <div v-else @click="alertLangUpdate" style="cursor: pointer; display: flex; align-items: center;">
              <span class="setting-value">{{ t.langValue }}</span>
              <i class="fa-solid fa-lock text-muted ms-2" style="font-size: 12px;"></i>
            </div>
          </div>
        </div>

        <div class="setting-item" @click="checkForUpdate">
          <div class="setting-left">
            <div class="icon-box bg-red-light"><i class="fa-solid fa-arrows-rotate text-red"></i></div>
            <span class="setting-label">{{ t.update }}</span>
          </div>
          <div class="setting-right">
            <span class="setting-value">{{ t.curVer }} {{ currentVersion }}</span>
            <span v-if="hasUpdate" class="badge bg-danger ms-2 rounded-pill shadow-sm" style="font-size:10px">1</span>
            <i class="fa-solid fa-chevron-right arrow-icon ms-2"></i>
          </div>
        </div>
      </div>

      <div class="settings-group shadow-sm mt-4" v-if="userStore.isLoggedIn">
        <div class="setting-item action-item text-danger justify-content-center fw-bold" @click="handleLogout">
          <i class="fa-solid fa-arrow-right-from-bracket me-2"></i> {{ t.logout }}
        </div>
      </div>
      
      <div class="text-center text-muted small mt-4 pb-4 opacity-75">© 2026 山城 AI 智慧旅伴專案小組 | {{ t.curVer }} {{ currentVersion }}</div>
    </div>

    <div class="update-overlay" :class="{ 'active': showUpdateModal }">
      <div class="update-backdrop" @click="closeUpdateModal"></div>
      <div class="update-card shadow-lg">
        <div class="update-icon-wrap">
          <i class="fa-brands fa-apple fs-1 text-dark" v-if="updateState !== 'downloading' && updateState !== 'ready'"></i>
          <i class="fa-solid fa-cloud-arrow-down fs-1 text-primary" v-if="updateState === 'downloading'"></i>
          <i class="fa-solid fa-circle-check fs-1 text-success" v-if="updateState === 'ready'"></i>
        </div>
        <h4 class="fw-bold mb-2">Software Update</h4>
        <div class="update-content">
          <div v-if="updateState === 'up-to-date'" class="text-muted d-flex flex-column align-items-center gap-2 my-4">
            <p class="fw-bold text-dark mb-0">山城 AI 旅伴 {{ currentVersion }}</p>
            <p class="small">{{ t.upToDate }}</p>
          </div>
          <div v-if="updateState === 'checking'" class="text-muted d-flex flex-column align-items-center gap-3 my-4">
            <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
            {{ t.checking }}
          </div>
          <div v-if="updateState === 'available' && nextUpdateInfo" class="text-start my-3 p-3 bg-light rounded-3">
            <div class="d-flex justify-content-between align-items-end mb-2">
              <span class="fw-bold fs-5">山城 AI 旅伴 {{ nextUpdateInfo.version }}</span>
              <span class="text-muted small">24.5 MB</span>
            </div>
            <p class="text-muted small mb-0 lh-lg">
              {{ t.updateContains }}<br>
              <span v-for="(feature, idx) in nextUpdateInfo.features" :key="idx">• {{ feature }}<br></span>
            </p>
          </div>
          <div v-if="updateState === 'downloading'" class="my-4">
            <div class="d-flex justify-content-between text-muted small mb-2 fw-bold"><span>{{ t.downloading }}</span><span>{{ downloadProgress }}%</span></div>
            <div class="progress" style="height: 8px;"><div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" :style="{ width: downloadProgress + '%' }"></div></div>
          </div>
          <div v-if="updateState === 'ready'" class="my-4 text-success fw-bold">{{ t.installReady }}</div>
        </div>
        <div class="update-actions mt-4">
          <button v-if="updateState === 'available'" class="btn-update-primary w-100" @click="startDownload">{{ t.btnDownload }}</button>
          <button v-if="updateState === 'checking' || updateState === 'available' || updateState === 'up-to-date'" class="btn-update-secondary w-100 mt-2" @click="closeUpdateModal">{{ t.btnClose }}</button>
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
import { NGROK_BASE_URL } from '../config';

const isEditing = ref(false);
const pushEnabled = ref(true);
const editForm = ref({ diet: '', travel: '', interest: '' });

const isResetting = ref(false);
const isLoading = ref(false);
const resetForm = ref({ otp: '', newPassword: '' });

// 🌟 版本設定
const APP_VERSIONS = [
  { version: 'v1.3.0', features: ['優化 AI 行程推薦引擎', '新增官方即時爬蟲同步功能'] },
  { version: 'v1.4.0', features: ['🗺️ 支援離線地圖導航功能', '🌐 新增語音導覽多國語系 (日、韓)', '⚡ 大幅提升 AI 辨識速度'] },
  { version: 'v1.5.0', features: ['🌐 系統介面多國語言切換 (支援中/英/日/韓)', '🛠️ 介面優化與系統穩定性提升', '🔐 增強使用者資料安全防護'] }
];

const currentVersion = ref('');
const hasUpdate = ref(false);
const nextUpdateInfo = ref(null);
const showUpdateModal = ref(false);
const updateState = ref('idle'); 
const downloadProgress = ref(0);

// 🌟 四國語言字典 (重點：偏好選項現在為 Object 對照)
const sysLang = ref(localStorage.getItem('shancheng_sys_lang') || 'zh');
const systemLanguage = ref(sysLang.value);

const t = computed(() => {
  const dict = {
    zh: {
      sysSet: '系統設定', visitor: '訪客 (請先登入)', pwdChange: '變更密碼 (Email 驗證)', pref: '旅遊與偏好 (AI 推薦參考)', 
      diet: '飲食偏好', travel: '預設交通方式', interest: '旅遊主題', save: '儲存變更', appSet: '應用程式設定', 
      push: '推播通知', lang: '系統語言切換', update: '系統更新', logout: '登出帳號', curVer: '目前版本',
      editBtn: '編輯資料', saveBtn: '儲存', otpHint: '輸入 6 碼驗證碼', newPwdHint: '新密碼 (8-20碼英數)', submitBtn: '確認重設', processing: '處理中...',
      upToDate: '您的系統已是最新版本。', checking: '正在檢查更新項目...', updateContains: '此更新項目包含：', downloading: '正在下載...', installReady: '下載完成！正在重新啟動系統...', btnDownload: '下載並安裝', btnClose: '關閉', notSet: '尚未設定', langValue: '繁體中文',
      dietOpts: { '無限制': '無限制', '全素食': '全素食', '蛋奶素': '蛋奶素', '無麩質': '無麩質', '不吃牛': '不吃牛' },
      travelOpts: { '大眾運輸 + 步行': '大眾運輸 + 步行', '自行開車': '自行開車', '機車機動': '機車機動', '低碳自行車': '低碳自行車' },
      interestOpts: { '美食饗宴': '美食饗宴', '文化歷史': '文化歷史', '自然生態': '自然生態', '體驗式旅行': '體驗式旅行' }
    },
    en: {
      sysSet: 'Settings', visitor: 'Guest (Login Required)', pwdChange: 'Change Password', pref: 'Travel Preferences', 
      diet: 'Dietary Needs', travel: 'Transport', interest: 'Main Interest', save: 'Save Changes', appSet: 'App Settings', 
      push: 'Notifications', lang: 'System Language', update: 'System Update', logout: 'Logout', curVer: 'Version',
      editBtn: 'Edit Info', saveBtn: 'Save', otpHint: 'OTP (6 digits)', newPwdHint: 'New Password', submitBtn: 'Reset', processing: 'Processing...',
      upToDate: 'System is up to date.', checking: 'Checking...', updateContains: 'Updates:', downloading: 'Downloading...', installReady: 'Done! Restarting...', btnDownload: 'Install', btnClose: 'Close', notSet: 'Not set', langValue: 'English',
      dietOpts: { '無限制': 'No Limit', '全素食': 'Vegan', '蛋奶素': 'Vegetarian', '無麩質': 'Gluten-Free', '不吃牛': 'No Beef' },
      travelOpts: { '大眾運輸 + 步行': 'Public Transit', '自行開車': 'Drive Car', '機車機動': 'Scooter', '低碳自行車': 'Eco Bike' },
      interestOpts: { '美食饗宴': 'Foodie', '文化歷史': 'Culture', '自然生態': 'Nature', '體驗式旅行': 'Experience' }
    },
    ja: {
      sysSet: 'システム設定', visitor: 'ゲスト (要ログイン)', pwdChange: 'パスワード変更', pref: '旅行の好み', 
      diet: '食事制限', travel: '移動手段', interest: 'テーマ', save: '変更を保存', appSet: 'アプリ設定', 
      push: '通知設定', lang: '言語設定', update: 'システム更新', logout: 'ログアウト', curVer: 'バージョン',
      editBtn: 'プロフィール編集', saveBtn: '保存', otpHint: '認証コード(6桁)', newPwdHint: '新しいパスワード', submitBtn: 'リセット', processing: '処理中...',
      upToDate: '最新バージョンです。', checking: '確認中...', updateContains: '更新内容：', downloading: 'ダウンロード中...', installReady: '完了！再起動中...', btnDownload: '更新する', btnClose: '閉じる', notSet: '未設定', langValue: '日本語',
      dietOpts: { '無限制': '制限なし', '全素食': 'ヴィーガン', '蛋奶素': 'ベジタリアン', '無麩質': 'グルテンフリー', '不吃牛': '牛肉不可' },
      travelOpts: { '大眾運輸 + 步行': '公共交通と徒歩', '自行開車': '車', '機車機動': 'バイク', '低碳自行車': 'エコ自転車' },
      interestOpts: { '美食饗宴': 'グルメ', '文化歷史': '歴史文化', '自然生態': '自然生態', '體驗式旅行': '体験型旅行' }
    },
    ko: {
      sysSet: '시스템 설정', visitor: '게스트 (로그인 필요)', pwdChange: '비밀번호 변경', pref: '여행 취향', 
      diet: '식단 선호', travel: '교통 수단', interest: '여행 테마', save: '저장하기', appSet: '앱 설정', 
      push: '푸시 알림', lang: '언어 설정', update: '시스템 업데이트', logout: '로그아웃', curVer: '현재 버전',
      editBtn: '정보 수정', saveBtn: '저장', otpHint: '인증번호 6자리', newPwdHint: '새 비밀번호', submitBtn: '확인', processing: '처리 중...',
      upToDate: '최신 버전입니다.', checking: '확인 중...', updateContains: '업데이트 내용:', downloading: '다운로드 중...', installReady: '완료! 재시작 중...', btnDownload: '설치하기', btnClose: '닫기', notSet: '미설정', langValue: '한국어',
      dietOpts: { '無限制': '제한 없음', '全素食': '비건', '蛋奶素': '베지테리언', '無麩質': '글루텐 프리', '不吃牛': '소고기 안 먹음' },
      travelOpts: { '大眾運輸 + 步行': '대중교통 및 도보', '自行開車': '자가용', '機車機動': '오토바이', '低碳自行車': '에코 자전거' },
      interestOpts: { '美食饗宴': '맛집 탐방', '文化歷史': '역사 문화', '自然生態': '자연 생태', '體驗式旅行': '체험 여행' }
    }
  };
  return dict[systemLanguage.value] || dict.zh;
});

// 🌟 轉換偏好顯示文字的功能
const translatePref = (type, value) => {
  if (!value) return t.value.notSet;
  const opts = t.value[`${type}Opts`];
  return opts[value] || value;
};

const levels = [
  { name: { zh: '初階山城旅人', en: 'Beginner', ja: '初心者トラベラー', ko: '초보 여행자' }, icon: '🌱' },
  { name: { zh: '中階山城旅人', en: 'Intermediate', ja: '中級トラベラー', ko: '중급 여행자' }, icon: '🌿' },
  { name: { zh: '高階永續大使', en: 'Ambassador', ja: '上級アンバサダー', ko: '고급 앰배서더' }, icon: '🌳' }
];

const displayLevel = computed(() => {
  if (userStore.greenPoints >= 1500) return levels[2];
  if (userStore.greenPoints >= 500) return levels[1];
  return levels[0];
});

onMounted(() => {
  userStore.restoreSession();
  if (userStore.isLoggedIn) {
    editForm.value.diet = userStore.dietPref || '無限制';
    editForm.value.travel = userStore.travelPref || '大眾運輸 + 步行';
    editForm.value.interest = userStore.interestPref || '自然生態';
  }
  const savedVersion = localStorage.getItem('shancheng_app_version') || 'v1.3.0';
  currentVersion.value = savedVersion;
  const vIndex = APP_VERSIONS.findIndex(v => v.version === savedVersion);
  if (vIndex >= 0 && vIndex < APP_VERSIONS.length - 1) {
    hasUpdate.value = true;
    nextUpdateInfo.value = APP_VERSIONS[vIndex + 1];
  }
});

const toggleEdit = () => {
  if (isEditing.value) {
    saveProfile();
  } else {
    isEditing.value = true;
    editForm.value.diet = userStore.dietPref || '無限制';
    editForm.value.travel = userStore.travelPref || '大眾運輸 + 步行';
    editForm.value.interest = userStore.interestPref || '自然生態';
  }
};

const saveProfile = async () => {
  try {
    const res = await fetch(`${NGROK_BASE_URL}/api/update_profile`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, 
      body: JSON.stringify({ 
        username: userStore.username, 
        diet_pref: editForm.value.diet, 
        travel_pref: editForm.value.travel, 
        interest_pref: editForm.value.interest 
      }) 
    });
    const result = await res.json();
    if (result.status === 'success') {
      userStore.updateProfile(editForm.value.diet, editForm.value.travel, editForm.value.interest);
      isEditing.value = false;
      alert(systemLanguage.value === 'zh' ? "✅ 儲存成功！" : "✅ Saved!");
    }
  } catch (err) { alert("Error"); }
};

const changeLanguage = () => {
  localStorage.setItem('shancheng_sys_lang', systemLanguage.value);
  window.location.reload(); 
};

const alertLangUpdate = () => { alert("🔒 v1.5.0 Required"); };
const togglePush = () => { alert("🔔 Notifications Updated"); };

const requestPasswordReset = async () => {
  if (isResetting.value) return (isResetting.value = false);
  try {
    const res = await fetch(`${NGROK_BASE_URL}/api/request_password_reset`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ username: userStore.username }) });
    const result = await res.json();
    if (result.status === 'success') { isResetting.value = true; }
  } catch (e) {}
};

const confirmPasswordReset = async () => {
  if (!resetForm.value.otp || !resetForm.value.newPassword) return;
  isLoading.value = true;
  try {
    const res = await fetch(`${NGROK_BASE_URL}/api/reset_password`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ username: userStore.username, otp: resetForm.value.otp, new_password: resetForm.value.newPassword }) });
    const result = await res.json();
    if (result.status === 'success') { isResetting.value = false; alert("Success"); }
  } catch (e) {} finally { isLoading.value = false; }
};

const handleLogout = () => { if (confirm("Logout?")) { userStore.logout(); router.push('/'); } };
</script>

<style scoped>
.settings-page { background-color: #f3f4f6; min-height: 100vh; }
.header-nav { background: white; padding: 18px; }
.profile-card { background: white; border-radius: 20px; padding: 25px 20px; display: flex; align-items: center; gap: 15px; margin-bottom: 30px; position: relative; }
.avatar-img { width: 70px; height: 70px; border-radius: 50%; border: 3px solid #ecfdf5; }
.profile-info { flex-grow: 1; }
.user-name { font-size: 18px; font-weight: 800; color: #1f2937; margin-bottom: 5px; }
.level-badge { background: #ecfdf5; color: #10b981; padding: 4px 10px; border-radius: 50px; font-size: 11px; font-weight: 700; }

/* 🌟 編輯按鈕樣式 */
.btn-edit-profile { position: absolute; top: 15px; right: 15px; border-radius: 50px; padding: 6px 14px; font-size: 13px; font-weight: 700; border: 1px solid #e5e7eb; transition: 0.2s; }
.btn-edit-profile:active { transform: scale(0.95); }

.section-title { font-size: 13px; font-weight: 700; color: #6b7280; margin: 0 0 10px 15px; text-transform: uppercase; }
.settings-group { background: white; border-radius: 20px; margin-bottom: 25px; overflow: hidden; }
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; }
.setting-left { display: flex; align-items: center; gap: 12px; }
.icon-box { width: 34px; height: 34px; border-radius: 10px; display: flex; justify-content: center; align-items: center; font-size: 14px; }
.setting-label { font-size: 15px; font-weight: 600; color: #374151; }
.setting-value { font-size: 14px; color: #6b7280; font-weight: 500; }

.custom-switch:checked { background-color: #10b981; border-color: #10b981; }
.custom-input { border-radius: 10px; }

.bg-green-light { background-color: #ecfdf5; } .text-green { color: #10b981; }
.bg-blue-light { background-color: #eff6ff; } .text-blue { color: #3b82f6; }
.bg-yellow-light { background-color: #fefce8; } .text-yellow { color: #eab308; }
.bg-gray-light { background-color: #f3f4f6; } .text-gray { color: #6b7280; }
.bg-purple-light { background-color: #faf5ff; } .text-purple { color: #a855f7; }
.bg-red-light { background-color: #fef2f2; } .text-red { color: #ef4444; }

.update-overlay { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; padding: 20px; }
.update-overlay.active { display: flex; }
.update-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); }
.update-card { position: relative; background: white; width: 100%; max-width: 340px; border-radius: 20px; padding: 30px 20px; text-align: center; z-index: 10; animation: popUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.update-icon-wrap { width: 60px; height: 60px; background: #f3f4f6; border-radius: 16px; display: flex; justify-content: center; align-items: center; margin: 0 auto 15px; }
.btn-update-primary { background: #007aff; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 15px; }
.btn-update-secondary { background: transparent; color: #007aff; border: none; padding: 12px; border-radius: 12px; font-weight: 600; font-size: 15px; }
@keyframes popUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
</style>
