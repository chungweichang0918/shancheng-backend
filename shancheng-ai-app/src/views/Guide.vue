<template>
  <div class="guide-container">
    <div class="area-tabs shadow-sm">
      <router-link to="/" class="back-link" @click="stopAudio">←</router-link>
      <div class="tabs-wrapper">
        <button v-for="(area, index) in activeAreaData" :key="index" :class="['tab-item', { active: currentAreaIndex === index }]" @click="currentAreaIndex = index">
          {{ area.name }}
        </button>
      </div>
    </div>

    <div class="main-scroll-area">
      <div class="hero-image" :style="{ backgroundImage: `url(${activeArea?.img || ''})` }">
        <div class="image-overlay">
          <div class="area-badge">{{ t.agriZone }}</div>
          <h1 class="area-main-title">{{ activeArea?.fullName }}</h1>
          <p class="area-slogan">「{{ activeArea?.slogan }}」</p>
        </div>
      </div>

      <div class="content-body" v-if="activeArea">
        <section class="info-section mb-4">
          <h5 class="section-title">🎙️ {{ t.aiGuide }}</h5>
          <div class="mb-3">
            <div class="text-muted small fw-bold mb-2"><i class="fa-solid fa-location-dot me-1"></i> {{ t.selectSpot }}</div>
            <div class="d-flex flex-wrap gap-2">
              <button v-for="spot in activeArea.aiSpots" :key="spot" class="btn-chip" :class="{ 'active': selectedSpot === spot }" @click="selectedSpot = spot">
                {{ spot }}
              </button>
            </div>
          </div>

          <div class="mb-3">
            <div class="text-muted small fw-bold mb-2"><i class="fa-solid fa-language me-1"></i> {{ t.selectLang }}</div>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn-lang" :class="{ 'active': selectedLang === 'zh' }" @click="selectedLang = 'zh'">🇹🇼 中文</button>
              <button class="btn-lang" :class="{ 'active': selectedLang === 'tw' }" @click="selectedLang = 'tw'">🗣️ 台語</button>
              <button class="btn-lang" :class="{ 'active': selectedLang === 'en' }" @click="selectedLang = 'en'">🇺🇸 English</button>
              <button v-if="isV1_4_OrAbove" class="btn-lang new-feature" :class="{ 'active': selectedLang === 'ja' }" @click="selectedLang = 'ja'">🇯🇵 日語</button>
              <button v-if="isV1_4_OrAbove" class="btn-lang new-feature" :class="{ 'active': selectedLang === 'ko' }" @click="selectedLang = 'ko'">🇰🇷 韓語</button>
            </div>
          </div>

          <button class="btn-generate w-100 shadow-sm mb-3" @click="fetchGuide" :disabled="isLoading">
            <span v-if="isLoading">⏳ {{ t.generating }}</span>
            <span v-else>✨ {{ t.genBtn }}《{{ selectedSpot }}》</span>
          </button>

          <div class="ai-player-card shadow-sm" v-if="guideScript">
            <div class="player-header">
              <button class="btn-play" @click="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>
              <div class="player-info">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold text-white">{{ t.playing }}</span>
                  <span class="time-text">{{ isPlaying ? 'Playing...' : 'Paused' }}</span>
                </div>
                <div class="sound-wave" :class="{ 'playing': isPlaying }">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
            </div>
            <div class="script-box mt-3"><p class="script-text" v-html="formattedScript"></p></div>
          </div>
        </section>

        <section class="info-section">
          <h5 class="section-title">✨ {{ t.hotSpot }}</h5>
          <div class="spot-list">
            <div v-for="(spot, i) in activeArea.spots" :key="i" class="spot-card" @click="openSpotDetail(spot)">
              <div class="spot-icon">📍</div>
              <div class="spot-detail">
                <div class="spot-name">{{ spot.title }}</div>
                <p class="spot-desc">{{ spot.desc }} <span class="text-success small ms-1">({{ t.clickMore }})</span></p>
              </div>
            </div>
          </div>
        </section>

        <section class="info-section">
          <h5 class="section-title">🌾 {{ t.produce }}</h5>
          <div class="produce-chips">
            <span v-for="(item, i) in activeArea.produce" :key="i" class="chip">{{ item }}</span>
          </div>
        </section>

        <section class="info-section">
          <h5 class="section-title">🎨 {{ t.exp }}</h5>
          <div class="experience-grid">
            <div v-for="(exp, i) in activeArea.experiences" :key="i" class="exp-tile">
              <div class="exp-icon">💡</div>
              <div class="exp-text">{{ exp }}</div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="spot-modal-overlay" :class="{ 'active': showSpotModal }">
      <div class="spot-modal-backdrop" @click="showSpotModal = false"></div>
      <div class="spot-modal-card shadow-lg" v-if="selectedSpotDetail">
        <button class="spot-close-btn" @click="showSpotModal = false">✕</button>
        <img :src="selectedSpotDetail?.img || activeArea?.img" class="spot-modal-img" alt="景點照片" />
        <div class="spot-modal-body">
          <h4 class="fw-bold mb-2">{{ selectedSpotDetail.title }}</h4>
          <p class="text-success fw-bold small mb-3">{{ selectedSpotDetail.desc }}</p>
          <div class="spot-long-desc mb-4">{{ selectedSpotDetail.longDesc }}</div>
          <a :href="selectedSpotDetail.website" target="_blank" class="btn-official-site">
            <i class="fa-solid fa-arrow-up-right-from-square me-2"></i> {{ t.visitSite }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// 🌟 統一從 config.js 引入後端 API 網址
import { NGROK_BASE_URL } from '../config';

const appVersion = ref(localStorage.getItem('shancheng_app_version') || 'v1.3.0');
const isV1_4_OrAbove = computed(() => appVersion.value === 'v1.4.0' || appVersion.value === 'v1.5.0');

// 🌟 多國語言字典
const sysLang = ref(localStorage.getItem('shancheng_sys_lang') || 'zh');
const t = computed(() => {
  const dict = {
    zh: { aiGuide: 'AI 專屬語音導覽', selectSpot: '選擇導覽景點：', selectLang: '選擇導覽語言：', generating: 'AI 撰寫講稿中...', genBtn: '產生導覽', playing: '智慧導覽播放中', hotSpot: '熱門打卡景點', clickMore: '點擊看詳細', produce: '在地農特產', exp: '食農教育與體驗', visitSite: '訪問官方網站', agriZone: '休閒農業區' },
    en: { aiGuide: 'AI Audio Guide', selectSpot: 'Select Attraction:', selectLang: 'Select Language:', generating: 'AI is writing...', genBtn: 'Generate', playing: 'Smart Guide Playing', hotSpot: 'Popular Spots', clickMore: 'Tap for details', produce: 'Local Produce', exp: 'Local Experiences', visitSite: 'Visit Official Website', agriZone: 'Agri-Tourism Zone' },
    ja: { aiGuide: 'AI 音声ガイド', selectSpot: 'スポットを選択：', selectLang: '言語を選択：', generating: 'AIが原稿を作成中...', genBtn: 'ガイドを生成', playing: 'ガイド再生中', hotSpot: '人気スポット', clickMore: '詳細を見る', produce: '特産品', exp: '体験活動', visitSite: '公式サイトへ', agriZone: '農業レジャーエリア' },
    ko: { aiGuide: 'AI 음성 가이드', selectSpot: '명소 선택:', selectLang: '언어 선택:', generating: 'AI 스크립트 작성 중...', genBtn: '가이드 생성', playing: '가이드 재생 중', hotSpot: '인기 명소', clickMore: '자세히 보기', produce: '지역 특산물', exp: '체험 활동', visitSite: '공식 웹사이트 방문', agriZone: '레저 농업 구역' }
  };
  return dict[sysLang.value] || dict.zh;
});

const currentAreaIndex = ref(0);

const allLanguagesData = {
  zh: [
    { 
      name: "鹿谷鄉", fullName: "小半天休閒農業區", slogan: "竹林、茶香、歷史", img: '/lugu_ginkgo.jpg', aiSpots: ["大崙山銀杏森林", "小半天竹林"], 
      spots: [
        { title:"德興瀑布", desc:"生態秘境", img: "/waterfall.jpg", longDesc:"德興瀑布位於鹿谷鄉小半天風景區，分為上下兩層，水流源源不絕。周邊生态豐富，是夏季避暑、吸收芬多精的絕佳秘境，非常適合全家大小一同來此親近大自然。", website:"https://www.lugu.gov.tw/AboutUs/ScenicSpotInfo?alley=308" },
        { title:"大崙山銀杏森林", desc:"黃金雲海", img: "/forest_trail.jpg", longDesc:"擁有東南亞面積最大的銀杏林，每到秋季樹葉轉為金黃，搭配高山茶園與時常湧現的雲海，風景如詩如畫。觀景台可俯瞰壯麗的中部山巒。", website:"https://travel.nantou.gov.tw/attractions/dalun-mountain-gingko-forest/" },
        { title:"竹林古戰場", desc:"歷史與竹海", img: "/bamboo.jpg", longDesc:"擁有媲美京都嵐山的壯觀竹海，這裡曾是林爽文事件的古戰場，走在古道上不僅能享受竹林清幽，還能感受濃厚的歷史氛圍。", website:"https://www.lugu.gov.tw/AboutUs/ScenicSpotInfo?alley=340" },
        { title:"石馬公園", desc:"著名賞櫻景點", img: "/park.jpg", longDesc:"石馬公園以河津櫻聞名，每年花季吸引大量遊客。這裡更是具備少見的一年開兩次花的櫻花奇景，非常適合賞花踏青。", website:"https://travel.nantou.gov.tw/attractions/shima-park/" }
      ],
      produce: ["杉林溪高山茶", "冬筍/香筍", "竹炭加工品"], experiences: ["創意竹工藝", "手作黃金竹筍包", "特色茶席體驗"]
    },
    { 
      name: "魚池鄉", fullName: "大雁休閒農業區", slogan: "紅茶、陶藝、生態", img: '/bamboo.jpg', aiSpots: ["日月潭老茶廠", "澀水森林步道"], 
      spots: [
        { title:"澀水森林步道", desc:"水上瀑布", img: "/lugu_ginkgo.jpg", longDesc:"素有「台灣小瑞士」之稱的澀水社區，其森林步道擁有多樣的蕨類植物，猶如走入侏羅紀公園。步道盡頭更藏有迷人的水上瀑布。", website:"https://recreation.forest.gov.tw/Trail/RT?tr_id=075" },
        { title:"日月潭老茶廠", desc:"紅茶故鄉", img: "/tea_factory.jpg", longDesc:"保留了日治時期的製茶廠房結構，現在轉型為推廣有機農業的教育場所。在此可了解阿薩姆紅茶的歷史，並品嚐最純粹的台灣茶香。", website:"https://www.sunmoonlake.gov.tw/zh-tw/Attractions/Attractions?a=20&id=96" }
      ],
      produce: ["日月潭紅茶", "台茶18號", "在地香菇"], experiences: ["深入茶園採茶", "白仙土柴窯捏陶", "紅茶冰淇淋"] 
    },
    { 
      name: "國姓鄉", fullName: "糯米橋休閒農業區", slogan: "古蹟、咖啡、客家", img: '/bridge.jpg', aiSpots: ["糯米橋古蹟", "九二一地震紀念園區"], 
      spots: [
        { title:"糯米橋", desc:"縣定古蹟", img: "/bridge.jpg", longDesc:"糯米橋建於日治時期，是利用糯米、紅糖與石灰拌合而成的傳統客家建築工法。歷經多次風災仍屹立不搖，是國姓鄉最知名的地標。", website:"https://travel.nantou.gov.tw/attractions/nuomi-bridge/" },
        { title:"茄苳神木", desc:"寶島樹洞", img: "/Sacred_tree.jpg", longDesc:"這棵百年茄苳神木不僅樹型巨大，最特別的是其樹洞的形狀從特定角度看過去，宛如一幅台灣寶島的地圖，是熱門的攝影打卡熱點。", website:"https://travel.nantou.gov.tw/attractions/autumn-maple-shenmu/" }
      ],
      produce: ["國姓精品咖啡", "冷泉米", "柑林枇杷"], experiences: ["咖啡烘豆手沖", "冷泉米爆米香", "客家牛搵水饗宴"] 
    }
  ],
  en: [
    { 
      name: "Lugu", fullName: "Xiaobantian Agri-Zone", slogan: "Bamboo, Tea, History", img: '/lugu_ginkgo.jpg', aiSpots: ["Dalun Mt. Ginkgo", "Xiaobantian Bamboo"], 
      spots: [
        { title:"Dexing Waterfall", desc:"Ecological Secret", img: "/waterfall.jpg", longDesc:"Located in Xiaobantian, this two-tier waterfall has a continuous flow of water. Surrounded by rich ecology, it's a great place to escape the summer heat.", website:"https://www.lugu.gov.tw/AboutUs/ScenicSpotInfo?alley=308" },
        { title:"Ginkgo Forest", desc:"Golden Clouds", img: "/forest_trail.jpg", longDesc:"The largest ginkgo forest in SE Asia. Leaves turn golden in autumn, creating a picturesque view with mountain tea gardens and frequent sea of clouds.", website:"https://travel.nantou.gov.tw/attractions/dalun-mountain-gingko-forest/" },
        { title:"Bamboo Battlefield", desc:"History & Bamboo", img: "/bamboo.jpg", longDesc:"A spectacular bamboo forest rivaling Kyoto. Walk the ancient trail to enjoy the tranquility and rich historical atmosphere of the Lin Shuangwen rebellion.", website:"https://www.lugu.gov.tw/AboutUs/ScenicSpotInfo?alley=340" },
        { title:"Shima Park", desc:"Cherry Blossoms", img: "/park.jpg", longDesc:"Famous for Kawazu cherry blossoms, attracting crowds every blooming season. It features a rare phenomenon of blooming twice a year.", website:"https://travel.nantou.gov.tw/attractions/shima-park/" }
      ],
      produce: ["Shanlinxi Alpine Tea", "Winter Bamboo Shoots", "Bamboo Charcoal"], experiences: ["Creative Bamboo Crafts", "Handmade Buns", "Tea Ceremony"]
    },
    { 
      name: "Yuchi", fullName: "Dayan Agri-Zone", slogan: "Black Tea, Pottery, Ecology", img: '/bamboo.jpg', aiSpots: ["Antique Assamu Tea Farm", "Seshui Forest Trail"], 
      spots: [
        { title:"Seshui Forest Trail", desc:"Water Waterfall", img: "/lugu_ginkgo.jpg", longDesc:"Known as 'Taiwan's Little Switzerland', its forest trail has a variety of ferns, like walking into Jurassic Park. There's a charming waterfall at the end.", website:"https://recreation.forest.gov.tw/Trail/RT?tr_id=075" },
        { title:"Antique Tea Farm", desc:"Hometown of Tea", img: "/tea_factory.jpg", longDesc:"Retains the tea factory structure from the Japanese colonial period, now an educational place promoting organic agriculture. Taste the purest Taiwanese tea.", website:"https://www.sunmoonlake.gov.tw/zh-tw/Attractions/Attractions?a=20&id=96" }
      ],
      produce: ["Sun Moon Lake Tea", "Ruby Black Tea", "Local Mushrooms"], experiences: ["Tea Picking", "Pottery Making", "Black Tea Ice Cream"] 
    },
    { 
      name: "Guoshing", fullName: "Nuomi Bridge Agri-Zone", slogan: "Heritage, Coffee, Hakka", img: '/bridge.jpg', aiSpots: ["Nuomi Bridge", "921 Earthquake Park"], 
      spots: [
        { title:"Nuomi Bridge", desc:"County Monument", img: "/bridge.jpg", longDesc:"Built during the Japanese rule, using traditional Hakka construction with glutinous rice, brown sugar, and lime. It stands firm after many typhoons.", website:"https://travel.nantou.gov.tw/attractions/nuomi-bridge/" },
        { title:"Autumn Maple Tree", desc:"Treasure Island Hole", img: "/Sacred_tree.jpg", longDesc:"This century-old tree is huge. The shape of its tree hole looks exactly like the map of Taiwan from a specific angle, a popular photo spot.", website:"https://travel.nantou.gov.tw/attractions/autumn-maple-shenmu/" }
      ],
      produce: ["Specialty Coffee", "Cold Spring Rice", "Loquat"], experiences: ["Coffee Roasting", "Puffed Rice Making", "Hakka Mochi"] 
    }
  ],
  ja: [
    { 
      name: "鹿谷郷", fullName: "小半天農業レジャー区", slogan: "竹林・お茶・歴史", img: '/lugu_ginkgo.jpg', aiSpots: ["大崙山イチョウの森", "小半天竹林"], 
      spots: [
        { title:"徳興滝", desc:"生態の秘境", img: "/waterfall.jpg", longDesc:"小半天風景区にある二段の滝。周囲は豊かな自然に恵まれ、マイナスイオンを浴びながら夏の暑さを逃れるのに最適な場所です。", website:"https://www.lugu.gov.tw/AboutUs/ScenicSpotInfo?alley=308" },
        { title:"イチョウの森", desc:"黄金の雲海", img: "/lugu_ginkgo.jpg", longDesc:"東南アジア最大のイチョウ林。秋には黄金色に染まり、茶園と雲海が織りなす風景は絵画のようです。展望台からの眺めは絶景です。", website:"https://travel.nantou.gov.tw/attractions/dalun-mountain-gingko-forest/" },
        { title:"竹林古戦場", desc:"歴史と竹の海", img: "/bamboo.jpg", longDesc:"京都の嵐山にも匹敵する見事な竹林。歴史的な古戦場でもあり、静寂の中で深い歴史の雰囲気を感じることができます。", website:"https://www.lugu.gov.tw/AboutUs/ScenicSpotInfo?alley=340" },
        { title:"石馬公園", desc:"桜の名所", img: "/park.jpg", longDesc:"河津桜で有名な公園。年に二回開花するという珍しい現象が見られ、お花見や散策に最適なスポットです。", website:"https://travel.nantou.gov.tw/attractions/shima-park/" }
      ],
      produce: ["杉林渓高山茶", "冬筍", "竹炭製品"], experiences: ["創作竹工芸", "黄金筍まん作り", "特製お茶席体験"]
    },
    { 
      name: "魚池郷", fullName: "大雁農業レジャー区", slogan: "紅茶・陶芸・生態", img: '/bamboo.jpg', aiSpots: ["日月潭老茶廠", "渋水森林歩道"], 
      spots: [
        { title:"渋水森林歩道", desc:"水上滝", img: "/lugu_ginkgo.jpg", longDesc:"「台湾の小スイス」と呼ばれる渋水コミュニティ。ジュラシックパークのようなシダ植物が茂り、奥には美しい滝が隠れています。", website:"https://recreation.forest.gov.tw/Trail/RT?tr_id=075" },
        { title:"日月潭老茶廠", desc:"紅茶の故郷", img: "/tea_factory.jpg", longDesc:"日本統治時代の製茶工場の構造を残し、現在は有機農業を推進する教育施設。台湾の純粋な紅茶の歴史と香りを楽しめます。", website:"https://www.sunmoonlake.gov.tw/zh-tw/Attractions/Attractions?a=20&id=96" }
      ],
      produce: ["日月潭紅茶", "台茶18号", "地元産しいたけ"], experiences: ["茶園での茶摘み", "陶芸体験", "紅茶アイス"] 
    },
    { 
      name: "国姓郷", fullName: "糯米橋農業レジャー区", slogan: "史跡・コーヒー・客家", img: '/bridge.jpg', aiSpots: ["糯米橋史跡", "921地震記念公園"], 
      spots: [
        { title:"糯米橋", desc:"県指定史跡", img: "/bridge.jpg", longDesc:"日本統治時代にもち米、黒糖、石灰を混ぜて造られた伝統的な客家建築の橋。度重なる台風にも耐え抜いた有名なランドマークです。", website:"https://travel.nantou.gov.tw/attractions/nuomi-bridge/" },
        { title:"茄苳神木", desc:"宝島の樹洞", img: "/scared_tree.jpg", longDesc:"樹齢百年の巨大な木。特定の角度から見ると樹洞の形が台湾の地図にそっくりで、人気の写真撮影スポットになっています。", website:"https://travel.nantou.gov.tw/attractions/autumn-maple-shenmu/" }
      ],
      produce: ["スペシャルティコーヒー", "冷泉米", "ビワ"], experiences: ["コーヒー焙煎", "ポン菓子作り", "客家餅体験"] 
    }
  ],
  ko: [
    { 
      name: "루구향", fullName: "샤오반티안 레저 농업 지구", slogan: "대나무 숲·차·역사", img: '/lugu_ginkgo.jpg', aiSpots: ["다룬산 은행나무 숲", "샤오반티안 대나무 숲"], 
      spots: [
        { title:"더싱 폭포", desc:"생태 비경", img: "/waterfall.jpg", longDesc:"샤오반티안에 위치한 이 폭포는 상하 두 층으로 나뉘어 끊임없이 흐릅니다. 풍부한 자연 속에서 여름철 더위를 피하기 좋은 완벽한 숨겨진 명소입니다.", website:"https://www.lugu.gov.tw/AboutUs/ScenicSpotInfo?alley=308" },
        { title:"은행나무 숲", desc:"황금빛 운해", img: "/lugu_ginkgo.jpg", longDesc:"동남아시아 최대의 은행나무 숲. 가을에는 잎이 황금빛으로 변하며, 고산 다원 및 운해와 어우러져 한 폭의 그림 같은 풍경을 자아냅니다.", website:"https://travel.nantou.gov.tw/attractions/dalun-mountain-gingko-forest/" },
        { title:"대나무 숲 옛 전장", desc:"역사와 대나무 숲", img: "/bamboo.jpg", longDesc:"교토의 아라시야마에 필적하는 웅장한 대나무 숲. 고도를 걸으며 대나무 숲의 고요함과 깊은 역사적 분위기를 느낄 수 있습니다.", website:"https://www.lugu.gov.tw/AboutUs/ScenicSpotInfo?alley=340" },
        { title:"스마 공원", desc:"유명한 벚꽃 명소", img: "/park.jpg", longDesc:"가와즈 벚꽃으로 유명하며 매년 꽃이 필 때 많은 관광객이 찾습니다. 1년에 두 번 꽃이 피는 희귀한 벚꽃 현상을 볼 수 있습니다.", website:"https://travel.nantou.gov.tw/attractions/shima-park/" }
      ],
      produce: ["샨린시 고산차", "겨울 죽순", "대나무 숯 제품"], experiences: ["창의적인 대나무 공예", "수제 황금 죽순 찐빵", "특색 있는 다도 체험"]
    },
    { 
      name: "위츠향", fullName: "다옌 레저 농업 지구", slogan: "홍차·도예·생태", img: '/bamboo.jpg', aiSpots: ["일월담 구 차공장", "써수이 숲길"], 
      spots: [
        { title:"써수이 숲길", desc:"수상 폭포", img: "/lugu_ginkgo.jpg", longDesc:"'대만의 작은 스위스'라 불리는 써수이 마을. 쥐라기 공원에 온 듯한 다양한 양치식물이 있으며, 길 끝에는 아름다운 수상 폭포가 숨겨져 있습니다.", website:"https://recreation.forest.gov.tw/Trail/RT?tr_id=075" },
        { title:"일월담 차공장", desc:"홍차의 고향", img: "/tea_factory.jpg", longDesc:"일제 강점기의 제다 공장 구조를 유지하며 유기농업을 알리는 교육 장소로 탈바꿈했습니다. 대만 홍차의 가장 순수한 향을 맛볼 수 있습니다.", website:"https://www.sunmoonlake.gov.tw/zh-tw/Attractions/Attractions?a=20&id=96" }
      ],
      produce: ["일월담 홍차", "타이차 18호", "현지 표고버섯"], experiences: ["차밭 찻잎 따기", "도예 체험", "홍차 아이스크림"] 
    },
    { 
      name: "궈싱향", fullName: "눠미차오 레저 농업 지구", slogan: "유적지·커피·하카", img: '/bridge.jpg', aiSpots: ["눠미차오 유적지", "921 지진 기념 공원"], 
      spots: [
        { title:"눠미차오", desc:"현 지정 유적지", img: "/bridge.jpg", longDesc:"일제 강점기에 찹쌀, 흑설탕, 석회를 섞어 만든 전통 하카 건축 방식의 다리. 수많은 태풍에도 견뎌낸 유명한 랜드마크입니다.", website:"https://travel.nantou.gov.tw/attractions/nuomi-bridge/" },
        { title:"자둥 신목", desc:"보물섬 나무 구멍", img: "/scared_tree.jpg", longDesc:"이 백 년 된 나무는 특정 각도에서 보면 나무 구멍의 모양이 대만의 지도와 똑같아 인기 있는 사진 촬영 명소입니다.", website:"https://travel.nantou.gov.tw/attractions/autumn-maple-shenmu/" }
      ],
      produce: ["궈싱 스페셜티 커피", "냉천 쌀", "간린 비파"], experiences: ["커피 로스팅 및 드립", "뻥튀기 만들기", "하카 전통 디저트 체험"] 
    }
  ]
};

const activeAreaData = computed(() => allLanguagesData[sysLang.value] || allLanguagesData['zh']);
const activeArea = computed(() => activeAreaData.value[currentAreaIndex.value]);

const selectedSpot = ref(activeArea.value?.aiSpots[0] || '');
const selectedLang = ref('zh');
const isLoading = ref(false);
const guideScript = ref('');
const isPlaying = ref(false);

let synth = window.speechSynthesis;
let resumeTimer = null;

const formattedScript = computed(() => guideScript.value.replace(/\n/g, '<br>'));

const showSpotModal = ref(false);
const selectedSpotDetail = ref(null);

const openSpotDetail = (spot) => {
  selectedSpotDetail.value = spot;
  showSpotModal.value = true;
};

watch(currentAreaIndex, () => { 
  stopAudio(); 
  guideScript.value = ''; 
  selectedSpot.value = activeArea.value?.aiSpots[0] || ''; 
});

onMounted(() => { 
  userStore.restoreSession();
  if (!userStore.isLoggedIn) {
    alert("🔒 智慧導覽功能需要先登入才能解鎖喔！");
    router.push('/');
    return;
  }
  
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => synth.getVoices();
  }
  synth.getVoices(); 
});

const fetchGuide = async () => {
  isLoading.value = true; 
  stopAudio(); 
  guideScript.value = '';
  try {
    const res = await fetch(`${NGROK_BASE_URL}/api/guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ attraction: selectedSpot.value, language: selectedLang.value })
    });
    const result = await res.json();
    if (result.status === 'success') { 
      guideScript.value = result.data.script; 
    }
  } catch (err) { alert("連線失敗，請檢查 API 網址！"); } finally { isLoading.value = false; }
};

const togglePlay = () => {
  if (isPlaying.value) { synth.pause(); isPlaying.value = false; }
  else {
    if (synth.paused && synth.speaking) { synth.resume(); isPlaying.value = true; }
    else { playAudio(guideScript.value, selectedLang.value); }
  }
};

const playAudio = (text, lang) => {
  stopAudio();
  
  const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[*#`_~]/g, '');
  
  window.utterance = new SpeechSynthesisUtterance(cleanText);
  const voices = synth.getVoices();
  
  if (lang === 'en') {
    window.utterance.lang = 'en-US';
    window.utterance.voice = voices.find(v => v.lang.includes('en-US') || v.name.includes('English')) || voices[0];
  } else if (lang === 'ja') {
    window.utterance.lang = 'ja-JP';
    window.utterance.voice = voices.find(v => v.lang.includes('ja-JP') || v.name.includes('Japan')) || voices[0];
  } else if (lang === 'ko') {
    window.utterance.lang = 'ko-KR';
    window.utterance.voice = voices.find(v => v.lang.includes('ko-KR') || v.name.includes('Korean')) || voices[0];
  } else {
    window.utterance.lang = 'zh-TW';
    window.utterance.voice = voices.find(v => v.lang.includes('zh-TW') || v.name.includes('Taiwan')) || voices[0];
  }
  
  window.utterance.rate = lang === 'en' ? 0.85 : 0.95;
  window.utterance.pitch = 1.1;
  
  window.utterance.onstart = () => { 
    isPlaying.value = true;
    resumeTimer = setInterval(() => { if (synth.speaking && !synth.paused) { synth.pause(); synth.resume(); } }, 10000);
  };
  window.utterance.onend = () => { isPlaying.value = false; clearInterval(resumeTimer); };
  window.utterance.onerror = () => { isPlaying.value = false; clearInterval(resumeTimer); };
  
  synth.speak(window.utterance);
};

const stopAudio = () => { synth.cancel(); isPlaying.value = false; if (resumeTimer) clearInterval(resumeTimer); };

onUnmounted(() => { stopAudio(); });
</script>

<style scoped>
.guide-container { background: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }
.area-tabs { background: white; padding: 10px 15px; display: flex; align-items: center; position: sticky; top: 0; z-index: 100; gap: 10px; }
.back-btn { font-size: 24px; color: #333; text-decoration: none; padding-right: 10px; }
.tabs-wrapper { display: flex; gap: 8px; flex-grow: 1; overflow-x: auto; white-space: nowrap; }
.tab-item { padding: 8px 18px; border-radius: 50px; border: 1px solid #e2e8f0; background: #f1f5f9; color: #64748b; font-weight: 600; font-size: 14px; transition: 0.3s; cursor: pointer; }
.tab-item.active { background: #10b981; color: white; border-color: #10b981; }
.hero-image { height: 340px; background-size: cover; background-position: center; position: relative; transition: background-image 0.5s ease-in-out; }
.image-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 70%); display: flex; flex-direction: column; justify-content: flex-end; padding: 25px 25px 60px 25px; }
.area-badge { background: #bef264; color: #064E3B; display: inline-block; width: fit-content; padding: 3px 12px; border-radius: 5px; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
.area-main-title { color: white; font-weight: 800; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.area-slogan { color: #bef264; margin: 5px 0 0; opacity: 0.95; font-size: 15px; }
.content-body { padding: 20px; margin-top: -30px; background: #f8fafc; border-radius: 30px 30px 0 0; position: relative; }
.btn-chip { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 50px; font-size: 14px; font-weight: 600; transition: 0.2s; cursor: pointer; }
.btn-chip.active { background: #ecfdf5; color: #059669; border-color: #10b981; }

.btn-lang { flex: 1 1 30%; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 0; font-weight: 700; color: #334155; transition: 0.2s; cursor: pointer; min-width: 80px; }
.btn-lang.active { background: #10b981; color: white; border-color: #10b981; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.new-feature { animation: pulse 2s infinite; border-color: #a855f7; color: #7e22ce; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(168,85,247, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(168,85,247, 0); } 100% { box-shadow: 0 0 0 0 rgba(168,85,247, 0); } }

.btn-generate { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 14px; border-radius: 16px; font-size: 15px; font-weight: 800; transition: 0.2s; }
.btn-generate:active { transform: scale(0.98); }
.ai-player-card { background: #1e293b; border-radius: 20px; padding: 18px; margin-bottom: 30px; }
.player-header { display: flex; align-items: center; gap: 15px; }
.btn-play { width: 45px; height: 45px; background: #10b981; color: white; border: none; border-radius: 50%; font-size: 18px; display: flex; justify-content: center; align-items: center; cursor: pointer; }
.player-info { flex-grow: 1; }
.time-text { font-size: 11px; color: rgba(255,255,255,0.5); }
.sound-wave { display: flex; gap: 4px; height: 15px; align-items: center; }
.sound-wave span { display: block; width: 4px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 50px; transition: 0.2s; }
.sound-wave.playing span { background: #bef264; animation: bounce 1s infinite ease-in-out; }
@keyframes bounce { 0%, 100% { height: 4px; } 50% { height: 15px; } }
.script-box { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; border-left: 3px solid #bef264; }
.script-text { font-size: 14px; line-height: 1.8; color: #f8fafc; margin: 0; font-weight: 400; }
.section-title { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 18px; display: flex; align-items: center; }
.spot-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
.spot-card { background: white; padding: 15px; border-radius: 16px; display: flex; gap: 15px; border: 1px solid #f1f5f9; box-shadow: 0 2px 5px rgba(0,0,0,0.02); cursor: pointer; transition: 0.2s; }
.spot-card:active { transform: scale(0.98); background: #f8fafc; }
.spot-icon { font-size: 20px; }
.spot-name { font-weight: 700; color: #1e293b; margin-bottom: 4px; }
.spot-desc { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }
.produce-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 30px; }
.chip { background: white; border: 1px solid #10b981; color: #10b981; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(16,185,129,0.1); }
.experience-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-bottom: 40px; }
.exp-tile { background: white; padding: 15px; border-radius: 16px; border-bottom: 3px solid #bef264; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.03); }
.exp-icon { font-size: 20px; margin-bottom: 8px; }
.exp-text { font-size: 13px; font-weight: 600; color: #334155; }

.spot-modal-overlay { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; padding: 20px; }
.spot-modal-overlay.active { display: flex; }
.spot-modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
.spot-modal-card { position: relative; background: white; width: 100%; max-width: 400px; border-radius: 24px; overflow: hidden; z-index: 10; animation: scaleUp 0.3s ease; }
.spot-close-btn { position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; font-size: 16px; cursor: pointer; z-index: 20; display: flex; justify-content: center; align-items: center; }
.spot-modal-img { width: 100%; height: 200px; object-fit: cover; }
.spot-modal-body { padding: 25px; }
.spot-long-desc { font-size: 15px; line-height: 1.7; color: #4b5563; }
.btn-official-site { display: block; width: 100%; background: #10b981; color: white; text-align: center; padding: 14px; border-radius: 12px; font-weight: 700; text-decoration: none; transition: 0.2s; }
.btn-official-site:active { transform: scale(0.98); }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
