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
คุณคือผู้เชี่ยวชาญด้านการพัฒนาไอเดียและนวัตกรรม
หน้าที่ของคุณคือช่วยเติมแต่งและขยายไอเดียให้สมบูรณ์และน่าสนใจมากขึ้น

ข้อมูลไอเดียปัจจุบัน:
- หัวข้อ: ${title || "-"}
- หมวดหมู่: ${category || "-"}
- ความสำคัญ: ${priority || "-"}
- รายละเอียด: ${description || "-"}
- แท็ก: ${tags ? tags.join(', ') : "-"}

**สำคัญ**: คุณต้องเติมแต่งและขยายไอเดียนี้ ไม่ใช่ตอบคำถามหรืออธิบายสิ่งที่ผู้ใช้ถามมา
หากผู้ใช้เขียนคำถามหรือหัวข้อสั้น ๆ ให้คุณช่วยขยายเป็นไอเดียที่สมบูรณ์

กรุณาให้คำแนะนำในรูปแบบ JSON โดยไม่มี markdown formatting:
{
  "improvedTitle": "หัวข้อที่ปรับปรุงและขยายแล้ว",
  "improvedDescription": "รายละเอียดที่ขยายและเติมแต่งให้สมบูรณ์",
  "suggestedTags": ["แท็ก1", "แท็ก2", "แท็ก3"],
  "implementationSteps": ["ขั้นตอนที่1", "ขั้นตอนที่2", "ขั้นตอนที่3"],
  "potentialChallenges": ["ความท้าทาย1", "ความท้าทาย2"],
  "successMetrics": ["ตัวชี้วัด1", "ตัวชี้วัด2"]
}

ตอบเฉพาะ JSON เท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติม

ตอบเป็นภาษาไทยและให้ข้อมูลที่เป็นประโยชน์จริง
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
