// ==========================================
// 🌐 山城 AI 智慧旅伴 - 共用 API 設定檔
// ==========================================
// 所有 Vue 元件統一從此處引入後端 API 網址，
// 未來 Ngrok 網址更換時只需修改這一個檔案。

export const NGROK_BASE_URL = "https://demystify-primary-correct.ngrok-free.dev";

export const API_HEADERS = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true"
};
