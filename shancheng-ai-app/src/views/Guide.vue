<template>
  <div class="guide-container">
    <div class="area-tabs shadow-sm">
      <router-link to="/" class="back-btn">←</router-link>
      <div class="tabs-wrapper">
        <button 
          v-for="(area, index) in areaData" 
          :key="index"
          :class="['tab-item', { active: currentAreaIndex === index }]"
          @click="currentAreaIndex = index"
        >
          {{ area.name }}
        </button>
      </div>
    </div>

    <div class="main-scroll-area">
      <div class="hero-image" :style="{ backgroundImage: `url(${activeArea.heroImage})` }">
        <div class="image-overlay">
          <div class="area-badge">休閒農業區</div>
          <h1 class="area-main-title">{{ activeArea.fullName }}</h1>
          <p class="area-slogan">「{{ activeArea.slogan }}」</p>
        </div>
      </div>

      <div class="content-body">
        <div class="ai-player-card shadow-sm">
          <div class="player-header">
            <button class="btn-play">▶</button>
            <div class="player-info">
              <div class="d-flex justify-content-between">
                <span class="fw-bold text-white">AI 深度語音導覽</span>
                <span class="time-text">01:45 / 04:20</span>
              </div>
              <div class="progress-bar-bg"><div class="progress-fill" style="width: 40%"></div></div>
            </div>
          </div>
        </div>

        <section class="info-section">
          <h5 class="section-title">✨ 熱門打卡景點</h5>
          <div class="spot-list">
            <div v-for="(spot, i) in activeArea.spots" :key="i" class="spot-card">
              <div class="spot-icon">📍</div>
              <div class="spot-detail">
                <div class="spot-name">{{ spot.title }}</div>
                <p class="spot-desc">{{ spot.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="info-section">
          <h5 class="section-title">🌾 在地農特產</h5>
          <div class="produce-chips">
            <span v-for="(item, i) in activeArea.produce" :key="i" class="chip">
              {{ item }}
            </span>
          </div>
        </section>

        <section class="info-section">
          <h5 class="section-title">🎨 食農教育與體驗</h5>
          <div class="experience-grid">
            <div v-for="(exp, i) in activeArea.experiences" :key="i" class="exp-tile">
              <div class="exp-icon">💡</div>
              <div class="exp-text">{{ exp }}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentAreaIndex = ref(0);

// 已更新穩定的高畫質圖片網址
const areaData = [
  {
    name: "鹿谷鄉",
    fullName: "小半天休閒農業區",
    slogan: "竹林、高山茶、歷史古道",
    heroImage: "https://images.unsplash.com/photo-1542259009477-d625272157b7?q=80&w=1600&auto=format&fit=crop",
    spots: [
      { title: "德興瀑布", desc: "天然雙層瀑布，夏季消暑生態秘境。" },
      { title: "大崙山銀杏森林", desc: "金黃銀杏與雲海交織，武岫農場觀景台。" },
      { title: "長源圳與竹林古戰場", desc: "壯觀竹林秘境，蘊含林爽文事件歷史。" },
      { title: "石馬公園", desc: "著名賞櫻景點，具備河津櫻一年二開奇景。" }
    ],
    produce: ["杉林溪高山茶", "冬筍/香筍", "竹炭加工品"],
    experiences: ["創意竹工藝 (竹掃燈 DIY)", "手作黃金竹筍包", "特色茶席與焙火體驗", "田媽媽風味竹筒餐"]
  },
  {
    name: "魚池鄉",
    fullName: "大雁休閒農業區",
    slogan: "紅茶、陶土、生態步道",
    // ⬇️ 這裡換成了新的、非常穩定的茶園圖片網址
    heroImage: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=1600&auto=format&fit=crop",
    spots: [
      { title: "澀水森林步道", desc: "侏儸紀風蕨類生態與水上瀑布。" },
      { title: "漫心湖公園", desc: "永續建築竹構藝術裝置《呼吸》。" },
      { title: "澀水社區聚落", desc: "充滿陶藝與茶香的瑞士風經典農村。" }
    ],
    produce: ["日月潭阿薩姆紅茶", "台茶18號", "在地香菇"],
    experiences: ["深入茶園採茶/揉茶體驗", "在地白仙土柴窯捏陶手作", "紅茶冰淇淋與茶捲點心"]
  },
  {
    name: "國姓鄉",
    fullName: "糯米橋休閒農業區",
    slogan: "客家風情、古蹟、精品咖啡",
    heroImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
    spots: [
      { title: "糯米橋", desc: "縣定三級古蹟，傳統客家工法建築。" },
      { title: "茄苳百年神木", desc: "獨特「台灣寶島」形狀中空樹洞。" },
      { title: "芙蓉瀑布與北港溪", desc: "清澈溪水與親水單車路徑。" }
    ],
    produce: ["國姓精品咖啡", "冷泉米", "柑林枇杷/草莓"],
    experiences: ["精品咖啡烘豆與手沖體驗", "冷泉米爆米香 DIY", "小品真柏盆栽製作", "客家麻糬/牛搵水饗宴"]
  }
];

const activeArea = computed(() => areaData[currentAreaIndex.value]);
</script>

<style scoped>
.guide-container { background: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }

/* 頂部標籤 */
.area-tabs { 
  background: white; padding: 10px 15px; display: flex; align-items: center; 
  position: sticky; top: 0; z-index: 100; gap: 10px;
}
.back-btn { font-size: 24px; color: #333; text-decoration: none; padding-right: 10px; }
.tabs-wrapper { display: flex; gap: 8px; flex-grow: 1; overflow-x: auto; white-space: nowrap; }
.tab-item { 
  padding: 8px 18px; border-radius: 50px; border: 1px solid #e2e8f0; 
  background: #f1f5f9; color: #64748b; font-weight: 600; font-size: 14px; transition: 0.3s; cursor: pointer;
}
.tab-item.active { background: #10b981; color: white; border-color: #10b981; }

/* 主圖 - 修正高度與排版 */
.hero-image { 
  height: 340px; /* 加高主圖區域，確保文字有充足空間 */
  background-size: cover; background-position: center; position: relative;
  transition: background-image 0.5s ease-in-out;
}
.image-overlay { 
  position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 70%);
  display: flex; flex-direction: column; justify-content: flex-end; 
  padding: 25px 25px 60px 25px; /* 增加底部的 padding，將文字往上推，避開重疊區 */
}
.area-badge { background: #bef264; color: #064E3B; display: inline-block; width: fit-content; padding: 3px 12px; border-radius: 5px; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
.area-main-title { color: white; font-weight: 800; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.area-slogan { color: #bef264; margin: 5px 0 0; opacity: 0.95; font-size: 15px; }

/* 內容主體 */
.content-body { padding: 20px; margin-top: -30px; background: #f8fafc; border-radius: 30px 30px 0 0; position: relative; }

/* 語音播放器 */
.ai-player-card { background: #1e293b; border-radius: 20px; padding: 18px; margin-bottom: 30px; }
.player-header { display: flex; align-items: center; gap: 15px; }
.btn-play { width: 45px; height: 45px; background: #10b981; color: white; border: none; border-radius: 50%; font-size: 18px; display: flex; justify-content: center; align-items: center; }
.player-info { flex-grow: 1; }
.time-text { font-size: 11px; color: rgba(255,255,255,0.5); }
.progress-bar-bg { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 8px; }
.progress-fill { height: 100%; background: #10b981; border-radius: 2px; }

/* 章節標題 */
.section-title { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 18px; display: flex; align-items: center; }

/* 景點清單 */
.spot-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
.spot-card { background: white; padding: 15px; border-radius: 16px; display: flex; gap: 15px; border: 1px solid #f1f5f9; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
.spot-icon { font-size: 20px; }
.spot-name { font-weight: 700; color: #1e293b; margin-bottom: 4px; }
.spot-desc { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }

/* 特產標籤 */
.produce-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 30px; }
.chip { background: white; border: 1px solid #10b981; color: #10b981; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(16,185,129,0.1); }

/* 體驗網格 */
.experience-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-bottom: 40px; }
.exp-tile { background: white; padding: 15px; border-radius: 16px; border-bottom: 3px solid #bef264; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.03); }
.exp-icon { font-size: 20px; margin-bottom: 8px; }
.exp-text { font-size: 13px; font-weight: 600; color: #334155; }
</style>