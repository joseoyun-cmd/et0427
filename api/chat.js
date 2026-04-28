// 가장 호환성이 높고 구체적인 모델 버전 명칭을 사용합니다.
const MODEL_NAME = "gemini-1.5-flash-001";

export default async function handler(req, res) {
  // 1. CORS 및 브라우저 보안 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST 요청만 가능합니다.' });

  // 2. 환경 변수 확인
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ 
      error: "Vercel 환경 변수 'GEMINI_API_KEY'를 찾을 수 없습니다. Settings -> Environment Variables를 확인하십시오." 
    });
  }

  /**
   * 3. 구글 Gemini API 호출 URL
   * v1beta 버전에서 특정 모델 번호(-001)를 명시하여 인식 오류를 해결합니다.
   */
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  try {
    const { message } = req.body;

    const payload = {
      contents: [{
        parts: [{
          text: `너는 1920년대 말투를 쓰는 유능한 탐정 조수야. 탐정님의 말씀에 조수답게 정중하면서도 재치 있게 대답해: ${message}`
        }]
      }]
    };

    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await geminiResponse.json();
    
    if (geminiResponse.ok) {
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "조수가 기록을 찾지 못해 대답을 망설이고 있습니다.";
      res.status(200).json({ text: aiText });
    } else {
      let errorDetail = data.error?.message || JSON.stringify(data.error) || "구글 API 서버 에러";
      
      if (errorDetail.includes("quota") || errorDetail.includes("429")) {
        errorDetail = "현재 구글 서비스 이용자가 많아 조수가 잠시 자리를 비웠습니다. (할당량 초과) 잠시 후 다시 시도해 주십시오.";
      }
      
      res.status(geminiResponse.status).json({ error: `[보고] ${errorDetail}` });
    }
  } catch (error) {
    res.status(500).json({ error: "서버 내부 통신 장애: " + error.message });
  }
}
