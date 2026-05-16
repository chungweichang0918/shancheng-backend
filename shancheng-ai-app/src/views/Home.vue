<template>
  <div class="home">
    <div class="top-bar d-flex justify-content-between align-items-center p-3 position-absolute w-100 z-2">
      
      <div class="notification-wrapper">
        <button class="btn-notif-pill shadow-sm" @click="toggleNotifications">
          <i class="fa-solid fa-bell text-warning me-1"></i>
          {{ t.notif }}
          <span v-if="unreadCount > 0" class="badge bg-danger rounded-pill ms-2 px-2 py-1" style="font-size:10px">
            {{ unreadCount }}
          </span>
        </button>

        <div v-if="showNotifications" class="overlay-closer" @click="showNotifications = false"></div>

        <transition name="fade-slide-up">
          <div class="notification-dropdown shadow-lg" v-if="showNotifications">
            <div class="dropdown-header">
              <span class="fw-bold fs-6 text-dark"><i class="fa-solid fa-bullhorn me-2 text-primary"></i>{{ t.notif }}</span>
              <div>
                <span class="text-primary small mark-read-btn me-3" @click.stop="syncOfficialNews" v-if="!isSyncingNews">
                  <i class="fa-solid fa-rotate me-1"></i>{{ t.aiSync }}
                </span>
                <span class="text-primary small me-3" v-else>
                  <i class="fa-solid fa-spinner fa-spin me-1"></i>{{ t.syncing }}
                </span>
                <span class="text-success small mark-read-btn" @click.stop="markAllAsRead">{{ t.markRead }}</span>
              </div>
            </div>
            <div class="dropdown-body">
              <div v-if="notifications.length === 0" class="text-center p-4 text-muted small">
                {{ t.noNotif }}
              </div>
              <div 
                v-for="notif in translatedNotifications" 
                :key="notif.id" 
                class="notif-item" 
                :class="{'unread': !notif.is_read}"
                @click="markAsRead(notif)"
              >
                <div class="notif-icon">{{ notif.icon }}</div>
                <div class="notif-content w-100">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <div class="notif-title text-truncate pe-2">{{ notif.title }}</div>
                    <div class="time-sensitive-badge shadow-sm animate-pulse" v-if="notif.title.includes('資訊') || notif.title.includes('Info') || notif.title.includes('情報') || notif.title.includes('정보') || notif.title.includes('消息') || notif.title.includes('活動')">
                      <i class="fa-solid fa-stopwatch"></i> {{ t.limitedTime }}
                    </div>
                  </div>
                  <div class="notif-desc">{{ notif.desc }}</div>
                  <div class="notif-time mt-1">{{ notif.time }}</div>
                </div>
                <div v-if="!notif.is_read" class="unread-dot"></div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="user-menu-wrapper position-relative">
        <button v-if="!userStore.isLoggedIn" class="btn btn-light rounded-pill shadow-sm fw-bold px-4" @click="openAuthModal(false)">
          <i class="fa-solid fa-user me-2"></i> {{ t.login }}
        </button>
        
        <div v-else class="user-chip-container position-relative">
          <div class="user-chip shadow-sm" @click="toggleUserMenu">
            <img :src="`https://ui-avatars.com/api/?name=${userStore.username}&background=10b981&color=fff`" class="avatar-sm" alt="avatar">
            <span class="ms-2 fw-bold text-dark">{{ userStore.username }}</span>
            <i class="fa-solid fa-chevron-down ms-2 text-muted" :class="{'rotate-icon': showUserMenu}" style="font-size: 10px; transition: 0.3s;"></i>
          </div>

          <div v-if="showUserMenu" class="overlay-closer" @click="showUserMenu = false"></div>

          <transition name="fade-slide-up">
            <div class="user-dropdown shadow-lg" v-if="showUserMenu">
              <div class="user-dropdown-info p-3">
                <div class="small text-muted mb-1">{{ t.currentPoints }}</div>
                <div class="fw-bold text-success fs-5">{{ userStore.greenPoints }} pt</div>
              </div>
              <div class="dropdown-divider m-0"></div>
              <div class="dropdown-item py-3" @click="router.push('/settings')">
                <i class="fa-solid fa-user-gear me-3 text-primary"></i>{{ t.settings }}
              </div>
              <div class="dropdown-item py-3" @click="router.push('/mission')">
                <i class="fa-solid fa-award me-3 text-warning"></i>{{ t.myMissions }}
              </div>
              <div class="dropdown-divider m-0"></div>
              <div class="dropdown-item py-3 text-danger fw-bold" @click="handleLogout">
                <i class="fa-solid fa-right-from-bracket me-3"></i>{{ t.logout }}
              </div>
              <div class="dropdown-item text-center bg-light py-2 small text-muted" @click="showUserMenu = false">
                <i class="fa-solid fa-angle-up me-1"></i> {{ t.collapse }}
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <header class="hero-section">
      <div class="container hero-content position-relative z-1">
        <h1 class="fw-bold">{{ t.title }}</h1>
        <p>{{ t.subtitle }}</p>
        <button class="btn-cta border-0 shadow" @click="handleFeatureClick('/form')">{{ t.btnStart }}</button>
      </div>
    </header>

    <main class="container mb-5 mt-4">
      <div class="row g-4">
        <div class="col-6 col-md-3" v-for="item in t.features" :key="item.title">
          <div class="card feature-card h-100" @click="handleFeatureClick(item.link)">
            <div class="card-body text-center py-4">
              <span class="feature-icon d-block mb-2">{{ item.icon }}</span>
              <h6 class="feature-card__title fw-bold mb-1">{{ item.title }}</h6>
              <p class="feature-card__text small text-muted mb-0">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div class="auth-overlay" :class="{ 'active': showAuthModal }">
      <div class="overlay-backdrop" @click="showAuthModal = false"></div>
      <div class="auth-card shadow-lg">
        <div class="text-end mb-2"><button class="btn-close" @click="showAuthModal = false"></button></div>
        
        <h4 class="fw-bold mb-4 text-center">
          {{ isVerifyMode ? t.otpVerify : (isRegisterMode ? t.createAcc : t.welcomeBack) }}
        </h4>
        
        <template v-if="isVerifyMode">
          <div class="alert alert-success small">{{ t.otpSent }}</div>
          <div class="mb-4">
            <label class="form-label text-muted small fw-bold">✉️ {{ t.otpLabel }}</label>
            <input type="text" v-model="verifyForm.emailOTP" class="form-control custom-input text-center fs-4 letter-spacing-2" placeholder="------" maxlength="6" />
          </div>
          <button class="btn-auth w-100 mb-3" @click="submitOTP" :disabled="isLoading">
            {{ isLoading ? t.processing : t.submitOtp }}
          </button>
        </template>

        <template v-else>
          <div class="mb-3">
            <label class="form-label text-muted small fw-bold">{{ t.acc }}</label>
            <input type="text" v-model="authForm.username" class="form-control custom-input" placeholder="" />
          </div>
          <div class="mb-3">
            <label class="form-label text-muted small fw-bold">{{ t.pwd }}</label>
            <input type="password" v-model="authForm.password" class="form-control custom-input" placeholder="" />
          </div>

          <template v-if="isRegisterMode">
            <div class="mb-3">
              <label class="form-label text-muted small fw-bold">✉️ Email</label>
              <input type="email" v-model="authForm.email" class="form-control custom-input" placeholder="example@gmail.com" />
            </div>
            <div class="row">
              <div class="col-6 mb-4">
                <label class="form-label text-muted small fw-bold">{{ t.dietL }}</label>
                <select v-model="authForm.dietPref" class="form-select custom-input">
                  <option>無限制</option><option>全素食</option><option>蛋奶素</option><option>無麩質</option><option>不吃牛</option>
                </select>
              </div>
              <div class="col-6 mb-4">
                <label class="form-label text-muted small fw-bold">{{ t.travelL }}</label>
                <select v-model="authForm.travelPref" class="form-select custom-input">
                  <option>大眾運輸 + 步行</option><option>自行開車</option><option>機車機動</option><option>低碳自行車</option>
                </select>
              </div>
            </div>
          </template>

          <button class="btn-auth w-100 mb-3" @click="handleAuth" :disabled="isLoading">
            {{ isLoading ? t.processing : (isRegisterMode ? t.regBtn : t.logBtn) }}
          </button>
          <div class="text-center text-muted small">
            {{ isRegisterMode ? t.hasAcc : t.noAcc }} 
            <a href="#" class="text-success fw-bold text-decoration-none" @click.prevent="isRegisterMode = !isRegisterMode">
              {{ isRegisterMode ? t.switchLog : t.switchReg }}
            </a>
          </div>
        </template>
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
const NGROK_BASE_URL = "https://demystify-primary-correct.ngrok-free.dev";

// 🌟 四國語言即時翻譯字典
const sysLang = ref(localStorage.getItem('shancheng_sys_lang') || 'zh');
const t = computed(() => {
  const dict = {
    zh: { 
      title: "今天想去哪裡探索山城？", subtitle: "專屬你的 AI 行程與智慧導覽", btnStart: "開始 AI 行程推薦", 
      notif: "官方公告", aiSync: "AI 同步", syncing: "同步中...", markRead: "全部已讀", noNotif: "目前沒有新通知喔！", login: "登入 / 註冊", 
      collapse: "收起選單", settings: "系統設定", myMissions: "我的任務", logout: "登出帳號", confirmLogout: "確定要登出嗎？", currentPoints: "目前累積點數",
      otpVerify: "信箱驗證 (OTP)", createAcc: "建立專屬帳號", welcomeBack: "歡迎回到山城", otpSent: "驗證碼已發送至您的信箱，請查看。", 
      otpLabel: "信箱驗證碼 (6碼)", processing: "處理中...", submitOtp: "送出驗證", acc: "帳號", pwd: "密碼", dietL: "飲食偏好", 
      travelL: "交通偏好", regBtn: "發送註冊驗證碼", logBtn: "登入", hasAcc: "已經有帳號了？", noAcc: "還沒有帳號？", switchLog: "切換登入", switchReg: "點此註冊", 
      limitedTime: "限時活動 (剩餘 24h)", 
      features: [
        { title: 'AI 行程推薦', desc: '客製化旅遊路線', icon: '🗺️', link: '/form' }, 
        { title: '智慧景點導覽', desc: '多國語音故事', icon: '🎧', link: '/guide' }, 
        { title: 'AI 山城萬物鏡', desc: '山城圖鑑收集', icon: '📷', link: '/scan' }, 
        { title: '集章綠色任務', desc: '完成獲得優惠券', icon: '🏅', link: '/mission' }
      ],
      notifMap: { 
        '歡迎來到山城！': '歡迎來到山城！', '感謝您註冊山城 AI 智慧旅伴，快去體驗您的專屬 AI 行程吧！': '感謝您註冊山城 AI 智慧旅伴，快去體驗您的專屬 AI 行程吧！',
        '即時官方資訊': '即時官方資訊', '您可以點擊通知面板右上角的「AI 即時同步」獲取最新官方活動。': '您可以點擊上方「AI 同步」獲取最新活動。'
      }
    },
    en: { 
      title: "Where to explore today?", subtitle: "Your AI Trip & Smart Guide", btnStart: "Start AI Trip Planner", 
      notif: "Official News", aiSync: "AI Sync", syncing: "Syncing...", markRead: "Mark Read", noNotif: "No new notifications!", login: "Login / Sign Up", 
      collapse: "Collapse", settings: "Settings", myMissions: "Missions", logout: "Logout", confirmLogout: "Are you sure you want to log out?", currentPoints: "Current Points",
      otpVerify: "Email Verification (OTP)", createAcc: "Create Account", welcomeBack: "Welcome Back", otpSent: "Verification code sent to your email.", 
      otpLabel: "OTP Code (6 digits)", processing: "Processing...", submitOtp: "Verify", acc: "Username", pwd: "Password", dietL: "Diet", 
      travelL: "Transport", regBtn: "Send OTP Code", logBtn: "Login", hasAcc: "Already have an account?", noAcc: "Don't have an account?", switchLog: "Login Here", switchReg: "Sign Up", 
      limitedTime: "Limited (24h left)",
      features: [
        { title: 'AI Trip Planner', desc: 'Customized Routes', icon: '🗺️', link: '/form' }, 
        { title: 'Smart Audio Guide', desc: 'Multilingual Stories', icon: '🎧', link: '/guide' }, 
        { title: 'AI Nature Lens', desc: 'Flora & Fauna Dex', icon: '📷', link: '/scan' }, 
        { title: 'Green Missions', desc: 'Earn Rewards', icon: '🏅', link: '/mission' }
      ],
      notifMap: { 
        '歡迎來到山城！': 'Welcome to Shancheng!', '感謝您註冊山城 AI 智慧旅伴，快去體驗您的專屬 AI 行程吧！': 'Thank you for registering! Experience your personal AI Trip today!',
        '即時官方資訊': 'Live Official Info', '您可以點擊通知面板右上角的「AI 即時同步」獲取最新官方活動。': 'Click "AI Sync" above to fetch the latest official events.'
      }
    },
    ja: { 
      title: "今日はどこへ探検しますか？", subtitle: "あなた専用のAI旅行＆スマートガイド", btnStart: "AI旅行プランナーを開始", 
      notif: "公式お知らせ", aiSync: "AI 同期", syncing: "同期中...", markRead: "既読にする", noNotif: "新しい通知はありません！", login: "ログイン / 登録", 
      collapse: "閉じる", settings: "設定", myMissions: "ミッション", logout: "ログアウト", confirmLogout: "ログアウトしますか？", currentPoints: "現在のポイント",
      otpVerify: "メール認証 (OTP)", createAcc: "アカウント作成", welcomeBack: "お帰りなさい", otpSent: "認証コードをメールに送信しました。", 
      otpLabel: "認証コード (6桁)", processing: "処理中...", submitOtp: "認証する", acc: "ユーザー名", pwd: "パスワード", dietL: "食事", 
      travelL: "交通手段", regBtn: "認証コードを送信", logBtn: "ログイン", hasAcc: "アカウントをお持ちですか？", noAcc: "アカウントがありませんか？", switchLog: "ログイン", switchReg: "登録", 
      limitedTime: "期間限定 (残り24時間)",
      features: [
        { title: 'AI 旅行プラン', desc: 'カスタムルート', icon: '🗺️', link: '/form' }, 
        { title: 'スマート音声ガイド', desc: '多言語のストーリー', icon: '🎧', link: '/guide' }, 
        { title: 'AI ネイチャー図鑑', desc: '動植物図鑑', icon: '📷', link: '/scan' }, 
        { title: 'グリーンミッション', desc: '報酬を獲得', icon: '🏅', link: '/mission' }
      ],
      notifMap: { 
        '歡迎來到山城！': '山城へようこそ！', '感謝您註冊山城 AI 智慧旅伴，快去體驗您的專屬 AI 行程吧！': 'ご登録ありがとうございます！専用のAI旅行をご体験ください！',
        '即時官方資訊': '公式リアルタイム情報', '您可以點擊通知面板右上角的「AI 即時同步」獲取最新官方活動。': '上の「AI同期」をクリックして最新のイベントを取得してください。'
      }
    },
    ko: { 
      title: "오늘 어디로 탐험할까요?", subtitle: "당신만의 AI 여행 및 스마트 가이드", btnStart: "AI 여행 계획 시작", 
      notif: "공지사항", aiSync: "AI 동기화", syncing: "동기화 중...", markRead: "모두 읽음", 단noNotif: "새로운 알림이 없습니다!", login: "로그인 / 가입", 
      collapse: "접기", settings: "설정", myMissions: "나의 미션", logout: "로그아웃", confirmLogout: "로그아웃 하시겠습니까?", currentPoints: "현재 포인트",
      otpVerify: "이메일 인증 (OTP)", createAcc: "계정 만들기", welcomeBack: "환영합니다", otpSent: "인증 코드가 이메일로 발송되었습니다.", 
      otpLabel: "인증 코드 (6자리)", processing: "처리 중...", submitOtp: "인증하기", acc: "아이디", pwd: "비밀번호", dietL: "식단", 
      travelL: "교통", regBtn: "인증 코드 전송", logBtn: "로그인", hasAcc: "이미 계정이 있으신가요?", noAcc: "계정이 없으신가요?", switchLog: "로그인", switchReg: "가입하기", 
      limitedTime: "기간 한정 (24h 남음)",
      features: [
        { title: 'AI 여행 플래너', desc: '맞춤형 경로', icon: '🗺️', link: '/form' }, 
        { title: '스마트 음성 가이드', desc: '다국어 스토리', icon: '🎧', link: '/guide' }, 
        { title: 'AI 자연 렌즈', desc: '도감', icon: '📷', link: '/scan' }, 
        { title: '그린 미션', desc: '보상 획득', icon: '🏅', link: '/mission' }
      ],
      notifMap: { 
        '歡迎來到山城！': '산청에 오신 것을 환영합니다!', '感謝您註冊山城 AI 智慧旅伴，快去體驗您的專屬 AI 行程吧！': '가입해 주셔서 감사합니다! 전용 AI 여행을 경험해 보세요!',
        '即時官方資訊': '실시간 공식 정보', '您可以點擊通知面板右上角的「AI 即時同步」獲取最新官方活動。': '최신 이벤트를 가져오려면 위의 "AI 동기화"를 클릭하세요.'
      }
    }
  };
  return dict[sysLang.value] || dict.zh;
});

const showAuthModal = ref(false);
const showUserMenu = ref(false);
const isRegisterMode = ref(false);
const isVerifyMode = ref(false);
const isLoading = ref(false);

const authForm = ref({ username: '', password: '', email: '', dietPref: '無限制', travelPref: '大眾運輸 + 步行' });
const verifyForm = ref({ emailOTP: '' });

const showNotifications = ref(false);
const notifications = ref([]);
const isSyncingNews = ref(false); 

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

// 🌟 自動翻譯資料庫通知
const translatedNotifications = computed(() => {
  return notifications.value.map(n => ({
    ...n, title: t.value.notifMap[n.title] || n.title, desc: t.value.notifMap[n.desc] || n.desc
  }));
});

const fetchNotifications = async () => {
  if (!userStore.isLoggedIn) return;
  try {
    const res = await fetch(`${NGROK_BASE_URL}/api/notifications?username=${userStore.username}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
    const result = await res.json();
    if (result.status === 'success') { notifications.value = result.data; }
  } catch (err) {}
};

const syncOfficialNews = async () => {
  isSyncingNews.value = true;
  try {
    const res = await fetch(`${NGROK_BASE_URL}/api/notifications/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ username: userStore.username }) });
    const result = await res.json();
    if (result.status === 'success') {
      if (result.added > 0) alert(`✅ AI 爬蟲成功萃取 ${result.added} 則最新官方活動！`); else alert(`👍 目前官方活動都已是最新狀態囉！`);
      fetchNotifications(); 
    }
  } catch (err) { alert("同步失敗，請確認後端是否啟動。"); } finally { isSyncingNews.value = false; }
};

const markAsRead = async (notif) => {
  if (notif.is_read) return;
  notif.is_read = true; 
  try { await fetch(`${NGROK_BASE_URL}/api/notifications/read`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ username: userStore.username, notif_id: notif.id }) }); } catch (err) {}
};

const markAllAsRead = async () => {
  notifications.value.forEach(n => n.is_read = true);
  try { await fetch(`${NGROK_BASE_URL}/api/notifications/read`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ username: userStore.username }) }); } catch (err) {}
};

const toggleNotifications = () => { 
  if (!userStore.isLoggedIn) { alert("🔒 請先登入才能查看專屬官方通知喔！"); openAuthModal(false); return; }
  showNotifications.value = !showNotifications.value; 
  if (showNotifications.value) fetchNotifications(); 
};

const toggleUserMenu = () => { showUserMenu.value = !showUserMenu.value; };
const handleLogout = () => { if (confirm(t.value.confirmLogout)) { userStore.logout(); showUserMenu.value = false; router.push('/'); } };

onMounted(() => { 
  userStore.restoreSession(); 
  if (userStore.isLoggedIn) fetchNotifications(); 
});

const handleFeatureClick = (link) => {
  if (!userStore.isLoggedIn) { alert("🔒 請先「註冊」或「登入」會員，才能解鎖完整的山城 AI 專屬功能喔！"); openAuthModal(false); } else { router.push(link); }
};

const openAuthModal = (isReg = false) => { isRegisterMode.value = isReg; isVerifyMode.value = false; showAuthModal.value = true; };

const handleAuth = async () => {
  if (!authForm.value.username || !authForm.value.password) return alert("請填寫帳號與密碼！");
  if (isRegisterMode.value) {
    const pwd = authForm.value.password;
    if (pwd.length < 8 || pwd.length > 20 || !/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) { return alert("密碼必須介於 8 到 20 碼之間，且包含英文與數字！"); }
    if (!authForm.value.email) return alert("信箱必填！");
  }
  isLoading.value = true;
  try {
    if (isRegisterMode.value) {
      const res = await fetch(`${NGROK_BASE_URL}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ username: authForm.value.username, password: authForm.value.password, email: authForm.value.email, diet_pref: authForm.value.dietPref, travel_pref: authForm.value.travelPref }) });
      const result = await res.json();
      if (result.status === 'success') { alert("✅ 註冊成功，請輸入驗證碼。"); isVerifyMode.value = true; } else { alert(result.message); }
    } else {
      const res = await fetch(`${NGROK_BASE_URL}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ username: authForm.value.username, password: authForm.value.password }) });
      const result = await res.json();
      if (result.status === 'success') { userStore.login(result.data); showAuthModal.value = false; fetchNotifications(); } else { alert(result.message); }
    }
  } catch (e) { alert("連線失敗"); } finally { isLoading.value = false; }
};

const submitOTP = async () => {
  isLoading.value = true;
  try {
    const res = await fetch(`${NGROK_BASE_URL}/api/verify_register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ username: authForm.value.username, email_otp: verifyForm.value.emailOTP }) });
    const result = await res.json();
    if (result.status === 'success') { alert(result.message); isVerifyMode.value = false; isRegisterMode.value = false; } else { alert(result.message); }
  } catch (e) { alert("連線失敗"); } finally { isLoading.value = false; }
};
</script>

<style scoped>
.hero-section { min-height: 45vh; background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('/lugu_ginkgo.jpg') no-repeat center center; background-size: cover; color: white; text-align: center; display: flex; align-items: center; justify-content: center; border-radius: 0 0 20px 20px; will-change: transform; transform: translateZ(0); }
.hero-content h1 { font-size: 2.5rem; margin-bottom: 15px; }
.btn-cta { background-color: #10b981; color: white; padding: 12px 40px; border-radius: 50px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: all 0.2s; text-decoration: none;}
.btn-cta:hover { transform: translateY(-2px); background-color: #059669; }

.feature-card { border: none; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: center; transition: all 0.2s; cursor: pointer; will-change: transform; }
.feature-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
.feature-card .card-body { padding: 30px 20px; }
.feature-icon { font-size: 32px; color: #10b981; display: block; margin-bottom: 15px;}
.feature-card__title { font-weight: bold; margin-bottom: 5px; }
.feature-card__text { color: #666; font-size: 0.9rem; margin-bottom: 0; }

.user-chip { background: white; border-radius: 50px; padding: 5px 15px 5px 5px; display: inline-flex; align-items: center; cursor: pointer; transition: 0.2s; border: 1px solid #e5e7eb; }
.user-chip:active { transform: scale(0.96); }
.avatar-sm { width: 32px; height: 32px; border-radius: 50%; }
.rotate-icon { transform: rotate(180deg); }

.overlay-closer { position: fixed; inset: 0; z-index: 998; }
.user-dropdown { position: absolute; top: 52px; right: 0; background: white; width: 220px; border-radius: 20px; z-index: 1000; overflow: hidden; transform-origin: top right; }
.dropdown-item { transition: 0.2s; cursor: pointer; display: flex; align-items: center; padding: 14px 20px; color: #334155; font-size: 14px; }
.dropdown-item:active { background-color: #f1f5f9; }
.dropdown-divider { height: 1px; background: #f1f5f9; margin: 4px 0; }

.notification-wrapper { position: relative; z-index: 1000; }
.btn-notif-pill { background: white; border: 1px solid #e5e7eb; padding: 6px 14px; border-radius: 50px; font-size: 13px; font-weight: 700; color: #374151; transition: 0.2s; display: flex; align-items: center; cursor: pointer;}
.btn-notif-pill:active { transform: scale(0.95); }
.notif-backdrop { position: fixed; inset: 0; z-index: 998; }
.notification-dropdown { position: absolute; top: 55px; left: 0; width: 320px; background: white; border-radius: 20px; overflow: hidden; z-index: 1000; transform-origin: top left; }
@media (max-width: 576px) { .notification-dropdown { width: 290px; } }

.dropdown-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
.mark-read-btn { cursor: pointer; font-weight: 700; transition: 0.2s; }
.mark-read-btn:active { transform: scale(0.95); }
.dropdown-body { max-height: 380px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.notif-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; position: relative; }
.notif-item:last-child { border-bottom: none; }
.notif-item:active { background: #f8fafc; }
.notif-item.unread { background: #f0fdf4; }
.notif-icon { font-size: 24px; }
.notif-content { flex: 1; text-align: left; overflow: hidden;}
.notif-title { font-size: 14px; font-weight: 800; color: #1e293b; line-height: 1.4; }
.notif-desc { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 4px; }
.notif-time { font-size: 11px; color: #94a3b8; font-weight: 600; }
.unread-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; position: absolute; right: 20px; top: 20px; }
.time-sensitive-badge { font-size: 10px; background: #fef2f2; color: #ef4444; padding: 3px 8px; border-radius: 50px; font-weight: 800; white-space: nowrap; border: 1px solid #fecaca; }
.animate-pulse { animation: pulse-red 2s infinite; }
@keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

.auth-overlay { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; }
.auth-overlay.active { display: flex; }
.overlay-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); }
.auth-card { position: relative; background: white; width: 90%; max-width: 400px; border-radius: 30px; padding: 30px; z-index: 10; animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.custom-input { border-radius: 12px; padding: 12px 15px; border: 1px solid #e5e7eb; background: #f9fafb; }
.custom-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); outline: none; }
.letter-spacing-2 { letter-spacing: 5px; }
.btn-auth { background: #10b981; color: white; border: none; border-radius: 12px; padding: 14px; font-weight: 800; transition: 0.2s; }
.btn-auth:active { transform: scale(0.98); }

@keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.fade-slide-up-enter-active, .fade-slide-up-leave-active { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.fade-slide-up-enter-from, .fade-slide-up-leave-to { opacity: 0; transform: translateY(-12px) scale(0.95); }
</style>
