import { defineStore } from 'pinia';

let inactivityTimer = null;

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    username: '',
    greenPoints: 0,
    level: 0,
    dietPref: '無限制',
    travelPref: '大眾運輸 + 步行',
    interestPref: '自然生態' // 🌟 新增：旅遊主題偏好
  }),
  actions: {
    login(userData) {
      this.isLoggedIn = true;
      this.username = userData.username;
      this.greenPoints = userData.score || 0;
      this.level = userData.level || 0;
      this.dietPref = userData.diet_pref || '無限制';
      this.travelPref = userData.travel_pref || '大眾運輸 + 步行';
      this.interestPref = userData.interest_pref || '自然生態';
      this.saveToLocal();
      this.startInactivityTimer(); // 🌟 登入後啟動防呆計時器
    },
    logout() {
      this.isLoggedIn = false;
      this.username = '';
      this.greenPoints = 0;
      this.level = 0;
      this.dietPref = '無限制';
      this.travelPref = '大眾運輸 + 步行';
      this.interestPref = '自然生態';
      localStorage.removeItem('user_session');
      this.stopInactivityTimer(); // 🌟 登出後停止計時
    },
    updateProfile(newDiet, newTravel, newInterest) {
      this.dietPref = newDiet;
      this.travelPref = newTravel;
      this.interestPref = newInterest;
      this.saveToLocal();
    },
    updateScore(newPoints) {
      this.greenPoints = newPoints;
      this.saveToLocal();
    },
    saveToLocal() {
      const session = {
        username: this.username,
        score: this.greenPoints,
        level: this.level,
        diet_pref: this.dietPref,
        travel_pref: this.travelPref,
        interest_pref: this.interestPref
      };
      localStorage.setItem('user_session', JSON.stringify(session));
    },
    async restoreSession() {
      const sessionStr = localStorage.getItem('user_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        this.login(session);

        try {
          const NGROK_BASE_URL = "https://demystify-primary-correct.ngrok-free.dev";
          const res = await fetch(`${NGROK_BASE_URL}/api/user?username=${this.username}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          });
          const result = await res.json();
          if (result.status === 'success') {
            this.greenPoints = result.data.score;
            this.level = result.data.level;
            this.saveToLocal();
          }
        } catch (error) {
          console.error("同步最新分數失敗", error);
        }
      }
    },
    // ==========================================
    // 🌟 核心防護：10 分鐘靜置自動登出機制
    // ==========================================
    startInactivityTimer() {
      this.stopInactivityTimer();
      const resetTimer = () => {
        if (!this.isLoggedIn) return;
        clearTimeout(inactivityTimer);
        // 設定 10 分鐘 (10 * 60 * 1000 毫秒)
        inactivityTimer = setTimeout(() => {
          this.logout();
          alert("🔒 您已閒置超過 10 分鐘，基於資安考量系統已自動將您登出。");
          window.location.href = '/'; // 強制導回首頁
        }, 10 * 60 * 1000); 
      };
      
      // 監聽使用者的任何互動，有互動就重置計時器
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('scroll', resetTimer);
      resetTimer(); // 啟動第一次
    },
    stopInactivityTimer() {
      if (inactivityTimer) clearTimeout(inactivityTimer);
    }
  }
});
