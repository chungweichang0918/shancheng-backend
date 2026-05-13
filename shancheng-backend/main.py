import os
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

# 1. 設定 Gemini API Key
GOOGLE_API_KEY = "AIzaSyDOB-irZVfm2WCuCzR9Aw114-b7ow7tr0M"
client = genai.Client(api_key=GOOGLE_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🌟 新增 is_retry 欄位，預設為 False
class TravelRequest(BaseModel):
    audience: str
    duration: str
    preferences: list[str]
    is_retry: bool = False 

@app.post("/api/recommend")
async def get_recommendation(req: TravelRequest):
    print(f"收到需求：對象={req.audience}, 偏好={req.preferences}, 重新生成={req.is_retry}")
    
    # 🌟 如果是重新生成，加上特別的指令要求 AI 換口味
    retry_instruction = ""
    if req.is_retry:
        retry_instruction = "\n⚠️ 特別指令：遊客對前一次的推薦不滿意。請務必提供一個『完全不同』的【私房秘境】或【獨特替代方案】，避開最大眾的景點，給出令人耳目一新的驚喜！"

    prompt = f"""
    你是一位專業的南投山城（鹿谷、魚池、國姓）在地導遊。
    請根據以下遊客的需求，規劃一個吸引人的旅遊行程建議：
    - 旅遊對象：{req.audience}
    - 停留時間：{req.duration}
    - 旅遊偏好：{', '.join(req.preferences)}
    {retry_instruction}

    請輸出一段約 80~100 字的「行程亮點預覽」，語氣要熱情、專業且具備在地特色。
    不要使用 Markdown 符號（如 ** 或 *），直接輸出純文字即可。
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        ai_text = response.text.strip()

        # 根據是否為重試，給予不同的標題前綴
        title_prefix = "🌟 私房推薦：" if req.is_retry else "✨ 專屬規劃："

        return {
            "status": "success",
            "data": {
                "title": f"{title_prefix} {req.audience} {req.duration}之旅",
                "preview": ai_text
            }
        }
    except Exception as e:
        print(f"AI 產生錯誤: {e}")
        return {"status": "error"}
    
if __name__ == "__main__":
    # 從環境變數抓 Port，抓不到就用 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)