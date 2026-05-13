<template>
  <div class="settings-page">
    <div class="header-nav shadow-sm d-flex align-items-center position-relative">
      <router-link to="/" class="back-link text-decoration-none text-dark fs-3 fw-bold position-absolute" style="left: 20px; z-index: 10;">
        ←
      </router-link>
      <h5 class="fw-bold m-0 text-center w-100">系統設定</h5>
    </div>

    <div class="container py-4 pb-5 mb-5">
      <div class="profile-card shadow-sm">
        <div class="avatar-wrap">
          <img src="https://ui-avatars.com/api/?name=User&background=10b981&color=fff&size=80" alt="Avatar" class="avatar-img">
        </div>
        <div class="profile-info">
          <h4 class="user-name">測試使用者</h4>
          <div class="user-level">
            <span class="level-badge">🌱 初階旅人 (350pt)</span>
          </div>
        </div>
        <button class="btn-edit-profile"><i class="fa-solid fa-pen"></i></button>
      </div>

      <h6 class="section-title">旅遊與偏好</h6>
      <div class="settings-group shadow-sm">
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-green-light"><i class="fa-solid fa-utensils text-green"></i></div>
            <span class="setting-label">飲食偏好 (AI 推薦參考)</span>
          </div>
          <div class="setting-right">
            <span class="setting-value">無限制</span>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-blue-light"><i class="fa-solid fa-car text-blue"></i></div>
            <span class="setting-label">預設交通方式</span>
          </div>
          <div class="setting-right">
            <span class="setting-value">大眾運輸 + 步行</span>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </div>
        </div>
      </div>

      <h6 class="section-title">應用程式設定</h6>
      <div class="settings-group shadow-sm">
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-yellow-light"><i class="fa-solid fa-bell text-yellow"></i></div>
            <span class="setting-label">推播通知</span>
          </div>
          <div class="setting-right">
            <div class="form-check form-switch m-0">
              <input class="form-check-input custom-switch" type="checkbox" checked>
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-gray-light"><i class="fa-solid fa-globe text-gray"></i></div>
            <span class="setting-label">多國語言切換</span>
          </div>
          <div class="setting-right">
            <span class="setting-value">繁體中文</span>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-purple-light"><i class="fa-solid fa-map-location-dot text-purple"></i></div>
            <span class="setting-label">離線地圖下載 (山區適用)</span>
          </div>
          <div class="setting-right">
            <div class="form-check form-switch m-0">
              <input class="form-check-input custom-switch" type="checkbox">
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-red-light"><i class="fa-solid fa-trash-can text-red"></i></div>
            <span class="setting-label">清除快取空間</span>
          </div>
          <div class="setting-right">
            <span class="setting-value">124 MB</span>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </div>
        </div>
      </div>

      <h6 class="section-title">支援與關於</h6>
      <div class="settings-group shadow-sm">
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-gray-light"><i class="fa-solid fa-circle-question text-gray"></i></div>
            <span class="setting-label">常見問題與回報</span>
          </div>
          <div class="setting-right"><i class="fa-solid fa-chevron-right arrow-icon"></i></div>
        </div>
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-gray-light"><i class="fa-solid fa-shield-halved text-gray"></i></div>
            <span class="setting-label">隱私權與服務條款</span>
          </div>
          <div class="setting-right"><i class="fa-solid fa-chevron-right arrow-icon"></i></div>
        </div>
        <div class="setting-item">
          <div class="setting-left">
            <div class="icon-box bg-green-light"><i class="fa-solid fa-leaf text-green"></i></div>
            <span class="setting-label">關於 USR 智慧山城計畫</span>
          </div>
          <div class="setting-right">
            <span class="setting-value">v1.0.0 (Beta)</span>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </div>
        </div>
      </div>

      <div class="settings-group shadow-sm mt-4">
        <div class="setting-item action-item text-danger justify-content-center fw-bold">
          <i class="fa-solid fa-arrow-right-from-bracket me-2"></i> 登出帳號
        </div>
      </div>
      
      <div class="text-center text-muted small mt-4 pb-4 opacity-75">
        © 2026 山城 AI 智慧旅伴專案小組
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page { background-color: #f3f4f6; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.header-nav { background: white; padding: 18px; }

/* 個人資料卡片 */
.profile-card {
  background: white; border-radius: 20px; padding: 25px 20px;
  display: flex; align-items: center; gap: 20px; margin-bottom: 30px; position: relative;
}
.avatar-img { width: 70px; height: 70px; border-radius: 50%; border: 3px solid #ecfdf5; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.profile-info { flex-grow: 1; }
.user-name { font-size: 20px; font-weight: 800; color: #1f2937; margin-bottom: 5px; }
.level-badge { background: #ecfdf5; color: #10b981; padding: 4px 12px; border-radius: 50px; font-size: 13px; font-weight: 700; }
.btn-edit-profile { position: absolute; top: 20px; right: 20px; background: #f3f4f6; border: none; width: 36px; height: 36px; border-radius: 50%; color: #6b7280; transition: 0.2s; }
.btn-edit-profile:hover { background: #e5e7eb; color: #374151; }

/* 設定群組 */
.section-title { font-size: 14px; font-weight: 700; color: #6b7280; margin: 0 0 10px 15px; text-transform: uppercase; letter-spacing: 0.5px; }
.settings-group { background: white; border-radius: 20px; margin-bottom: 25px; overflow: hidden; }
.setting-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background-color 0.2s;
}
.setting-item:last-child { border-bottom: none; }
.setting-item:active { background-color: #f9fafb; }
.action-item:active { background-color: #fef2f2; }

/* 列表左側 (Icon + 標籤) */
.setting-left { display: flex; align-items: center; gap: 15px; }
.icon-box { width: 36px; height: 36px; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 16px; }
.setting-label { font-size: 16px; font-weight: 600; color: #374151; }

/* 列表右側 (數值 + 箭頭) */
.setting-right { display: flex; align-items: center; gap: 10px; }
.setting-value { font-size: 14px; color: #9ca3af; font-weight: 500; }
.arrow-icon { color: #d1d5db; font-size: 14px; }

/* 開關樣式客製化 */
.custom-switch:checked { background-color: #10b981; border-color: #10b981; }
.custom-switch { width: 45px; height: 24px; cursor: pointer; }

/* 色塊變數 */
.bg-green-light { background-color: #ecfdf5; } .text-green { color: #10b981; }
.bg-blue-light { background-color: #eff6ff; } .text-blue { color: #3b82f6; }
.bg-yellow-light { background-color: #fefce8; } .text-yellow { color: #eab308; }
.bg-gray-light { background-color: #f3f4f6; } .text-gray { color: #6b7280; }
.bg-purple-light { background-color: #faf5ff; } .text-purple { color: #a855f7; }
.bg-red-light { background-color: #fef2f2; } .text-red { color: #ef4444; }
</style>