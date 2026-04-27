export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured in Vercel' });
  }

  try {
    // Gemini 2.5 Flash Preview API 호출 (Vercel 서버 측에서 실행됨)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: message }]
        }],
        systemInstruction: {
          parts: [{ text: "당신은 1920년대 사설 탐정 사무소의 조수입니다. 말투는 정중하면서도 시대적 배경에 어울리는 구식 말투(하오체 등)를 사용하세요. 탐정(사용자)을 보조하여 사건을 추리하는 역할을 수행합니다." }]
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API Error');
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "대답을 찾지 못했습니다.";
    
    return res.status(200).json({ text: aiResponse });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
