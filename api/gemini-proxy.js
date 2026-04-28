// Serverless Function (Node.js 환경)

// 1. Vercel 환경 변수에서 API 키를 안전하게 불러옵니다.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 2. 모델 엔드포인트는 고정된 주소를 사용합니다.
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

export default async function handler(req, res) {
    // 3. POST 요청만 허용합니다.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 4. 클라이언트가 보낸 JSON 페이로드를 가져옵니다.
        const payload = req.body;

        // 5. Gemini API에 요청을 중계합니다. (API 키는 서버에만 존재)
        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // 6. Gemini 응답의 상태 코드를 그대로 클라이언트에게 전달합니다.
        const data = await geminiResponse.json();

        if (geminiResponse.ok) {
            res.status(200).json(data);
        } else {
            // Gemini API에서 발생한 오류를 클라이언트에게 전달합니다.
            res.status(geminiResponse.status).json(data);
        }
    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: 'Internal Server Error during API call.', details: error.message });
    }
}
