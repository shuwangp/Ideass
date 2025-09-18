const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');

// Initialize Google AI (only if API key is available)
let genAI = null;
if (process.env.GOOGLE_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
}

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.AI_RATE_LIMIT_PER_HOUR || 50,
  message: {
    error: 'Too many AI requests, please try again later.',
  },
});

// AI suggestion for idea improvement
exports.suggestIdeaImprovement = async (req, res) => {
  try {
    const { title, description, category, priority, tags } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: 'Title or description is required for AI suggestion',
      });
    }

    // Check if Google AI is available
    if (!genAI) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please set GOOGLE_API_KEY in environment variables.',
      });
    }

    const prompt = `
คุณคือที่ปรึกษาด้านผลิตภัณฑ์และนวัตกรรม หน้าที่ของคุณคือ "ต่อยอดไอเดีย" ให้ก้าวหน้า นำสิ่งที่ผู้ใช้ให้มาไปขยายความ สร้างโครงร่างที่ลงมือทำได้ ไม่ทำงานแบบถาม-ตอบ

ข้อมูลที่มีอยู่ตอนนี้:
- หัวข้อ: ${title || "-"}
- หมวดหมู่: ${category || "-"}
- ความสำคัญ: ${priority || "-"}
- รายละเอียด/คำอธิบายที่ผู้ใช้พิมพ์มา (อาจเป็นประโยคสั้นหรือคำถาม): ${description || "-"}
- แท็ก: ${tags ? tags.join(', ') : "-"}

ข้อกำหนดสำคัญ:
1) ปฏิบัติเสมอว่าผู้ใช้ต้องการให้ "ขยายและเติมไอเดีย" ไม่ใช่ให้คำตอบเชิงอธิบายหรือโต้ตอบคำถาม
2) หากอินพุตเป็นคำถามหรือสั้นมาก ให้ตีความเป็นโจทย์ผลิตภัณฑ์แล้วสร้างแนวทางที่จับต้องได้
3) เนื้อหาเชิงปฏิบัติ: กลุ่มผู้ใช้เป้าหมาย คุณค่า/ปัญหาที่แก้ ฟีเจอร์หลัก ความแตกต่าง กลยุทธ์เริ่มต้น/ขยาย และรูปแบบรายได้อย่างย่อ
4) เขียนแบบกระชับ ชัดเจน ใช้ภาษากระตุ้นการลงมือทำ

เอาต์พุตต้องอยู่ในรูปแบบ JSON เดียวเท่านั้น (ห้าม markdown):
{
  "improvedTitle": "หัวข้อใหม่ที่ชัดเจน ดึงดูด และสะท้อนคุณค่า",
  "improvedDescription": "คำอธิบายแบบย่อ 5-8 ประโยค ครอบคลุมกลุ่มเป้าหมาย ปัญหา/คุณค่า ฟีเจอร์หลัก ความแตกต่าง กลยุทธ์เปิดตัว/ขยาย และแนวทางรายได้",
  "suggestedTags": ["แท็ก1", "แท็ก2", "แท็ก3"],
  "implementationSteps": ["ลำดับขั้นเริ่มต้น 4-6 ข้อที่ทำได้จริง"],
  "potentialChallenges": ["อุปสรรคสำคัญ 2-5 ข้อพร้อมมุมรับมืออย่างสั้น"],
  "successMetrics": ["ตัวชี้วัดผลลัพธ์ที่วัดได้ 3-6 รายการ"]
}

ตอบเฉพาะ JSON ภาษาไทยเท่านั้น ห้ามมีข้อความอื่นก่อนหรือหลัง JSON
`;

    const model = genAI.getGenerativeModel({ 
      model: process.env.AI_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS) || 1000,
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
      }
    });

    const result = await model.generateContent(prompt);
    let aiResponse = result.response.text();
    
    // ทำความสะอาด response - ลบ markdown formatting
    aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    try {
      const suggestion = JSON.parse(aiResponse);
      res.json({
        success: true,
        data: suggestion,
      });
    } catch (parseError) {
      // If JSON parsing fails, return the raw response
      res.json({
        success: true,
        data: {
          improvedTitle: title,
          improvedDescription: aiResponse,
          suggestedTags: tags || [],
          implementationSteps: [],
          potentialChallenges: [],
          successMetrics: [],
        },
      });
    }
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service is currently unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// AI analysis for idea connections
exports.analyzeIdeaConnections = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const { type = 'connections' } = req.body;

    // Check if Google AI is available
    if (!genAI) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please set GOOGLE_API_KEY in environment variables.',
      });
    }

    // Get the idea from database
    const Idea = require('../models/Idea');
    const idea = await Idea.findById(ideaId).populate('author', 'username');
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    let prompt = '';
    
    switch (type) {
      case 'connections':
        prompt = `
วิเคราะห์ไอเดียนี้และหาไอเดียที่เกี่ยวข้องหรือเชื่อมโยงกัน:

ไอเดีย: ${idea.title}
รายละเอียด: ${idea.description}
หมวดหมู่: ${idea.category}
แท็ก: ${idea.tags ? idea.tags.join(', ') : '-'}

กรุณาให้คำแนะนำในรูปแบบ JSON โดยไม่มี markdown formatting:
{
  "relatedIdeas": [
    {
      "title": "ชื่อไอเดียที่เกี่ยวข้อง",
      "reason": "เหตุผลที่เกี่ยวข้อง",
      "connectionType": "complementary|similar|opposite|sequential"
    }
  ],
  "potentialCollaborations": ["แนวทางความร่วมมือ1", "แนวทางความร่วมมือ2"],
  "marketOpportunities": ["โอกาสทางการตลาด1", "โอกาสทางการตลาด2"]
}
`;
        break;
        
      case 'development':
        prompt = `
วิเคราะห์ไอเดียนี้และให้แผนการพัฒนาที่เป็นไปได้:

ไอเดีย: ${idea.title}
รายละเอียด: ${idea.description}

กรุณาให้คำแนะนำในรูปแบบ JSON โดยไม่มี markdown formatting:
{
  "developmentPhases": [
    {
      "phase": "ระยะที่1",
      "description": "รายละเอียดระยะ",
      "timeline": "ระยะเวลา",
      "resources": ["ทรัพยากรที่ต้องการ"]
    }
  ],
  "technicalRequirements": ["ความต้องการทางเทคนิค1", "ความต้องการทางเทคนิค2"],
  "riskAssessment": ["ความเสี่ยง1", "ความเสี่ยง2"],
  "successFactors": ["ปัจจัยความสำเร็จ1", "ปัจจัยความสำเร็จ2"]
}
`;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid analysis type',
        });
    }

    const model = genAI.getGenerativeModel({ 
      model: process.env.AI_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS) || 1000,
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
      }
    });

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    
    try {
      const analysis = JSON.parse(aiResponse);
      res.json({
        success: true,
        data: analysis,
      });
    } catch (parseError) {
      res.json({
        success: true,
        data: {
          message: aiResponse,
          type: type,
        },
      });
    }
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI analysis service is currently unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// AI-powered search suggestions
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 2 characters long',
      });
    }

    // Check if Google AI is available
    if (!genAI) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please set GOOGLE_API_KEY in environment variables.',
      });
    }

    const prompt = `
ให้คำแนะนำการค้นหาสำหรับคำค้นหา: "${query}"

กรุณาให้คำแนะนำในรูปแบบ JSON โดยไม่มี markdown formatting:
{
  "suggestions": ["คำค้นหาที่แนะนำ1", "คำค้นหาที่แนะนำ2", "คำค้นหาที่แนะนำ3"],
  "relatedTerms": ["คำที่เกี่ยวข้อง1", "คำที่เกี่ยวข้อง2"],
  "categories": ["หมวดหมู่ที่เกี่ยวข้อง1", "หมวดหมู่ที่เกี่ยวข้อง2"]
}
`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.5,
    });

    const aiResponse = completion.choices[0].message.content;
    
    try {
      const suggestions = JSON.parse(aiResponse);
      res.json({
        success: true,
        data: suggestions,
      });
    } catch (parseError) {
      res.json({
        success: true,
        data: {
          suggestions: [query],
          relatedTerms: [],
          categories: [],
        },
      });
    }
  } catch (error) {
    console.error('AI Search Suggestions Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI search suggestions service is currently unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Rate limit middleware is now defined in routes file
