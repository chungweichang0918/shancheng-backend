import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 1. State (狀態：存放資料的地方)
  const greenPoints = ref(350) // 預設 350 點
  const unlockedStamps = ref(['start']) // 預設已解鎖的成就

  // 2. Actions (動作：改變資料的方法)
  // 增加點數的動作
  const addPoints = (points, stampName = null) => {
    greenPoints.value += points
    
    // 如果有傳入印章名稱，且還沒解鎖過，就加入解鎖名單
    if (stampName && !unlockedStamps.value.includes(stampName)) {
      unlockedStamps.value.push(stampName)
    }
  }

  return { greenPoints, unlockedStamps, addPoints }
})