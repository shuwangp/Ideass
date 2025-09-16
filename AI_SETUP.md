# AI Features Setup Guide

## Overview
This project now includes AI-powered features to help users improve their ideas, analyze connections, and get intelligent search suggestions.

## Features Added

### Backend AI Features
- **AI Idea Improvement**: Generate enhanced titles, descriptions, and implementation steps
- **AI Analysis**: Analyze idea connections and development plans
- **AI Search Suggestions**: Intelligent search recommendations
- **Rate Limiting**: Prevent API abuse with configurable limits
- **Authentication**: All AI endpoints require user authentication

### Frontend AI Features
- **AI Assistant Component**: Interactive AI suggestions in idea detail pages
- **AI Search**: Intelligent search with AI-powered suggestions
- **AI Suggestions Modal**: Apply AI improvements to ideas during creation/editing
- **Real-time AI Integration**: Seamless AI features throughout the application

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install @google/generative-ai express-rate-limit
```

#### Environment Configuration
Create a `.env` file in the backend directory with the following variables:

```env
# AI Configuration
GOOGLE_API_KEY=your-google-api-key-here
AI_MODEL=gemini-1.5-flash
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7

# Rate Limiting
AI_RATE_LIMIT_PER_HOUR=50
AI_RATE_LIMIT_PER_DAY=200

# Other existing variables...
MONGODB_URI=mongodb://localhost:27017/ai-idea-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Get Google AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign up or log in to your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file
5. Make sure to enable the Generative AI API in your Google Cloud project

### 2. Frontend Setup

The frontend AI features are already integrated and ready to use. No additional setup required.

### 3. Testing AI Features

#### Test AI Endpoints
```bash
# Start the backend server
cd backend
npm start

# Test AI suggestion endpoint
curl -X POST http://localhost:5000/api/ai/suggest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Mobile App Idea",
    "description": "An app for tracking daily habits",
    "category": "Technology",
    "priority": "high"
  }'
```

#### Test Frontend Features
1. Start both backend and frontend servers
2. Log in to the application
3. Navigate to "Create New Idea" page
4. Click "AI Assist" button to generate suggestions
5. Visit any idea detail page to see AI Assistant
6. Use AI Search in the ideas listing page

## API Endpoints

### POST /api/ai/suggest
Generate AI suggestions for idea improvement
```json
{
  "title": "string",
  "description": "string", 
  "category": "string",
  "priority": "string",
  "tags": ["string"]
}
```

### POST /api/ai/analyze/:ideaId
Analyze idea connections and development
```json
{
  "type": "connections" | "development"
}
```

### GET /api/ai/search-suggestions?query=search_term
Get AI-powered search suggestions

## Configuration Options

### AI Model Settings
- `AI_MODEL`: OpenAI model to use (default: gpt-3.5-turbo)
- `AI_MAX_TOKENS`: Maximum tokens per request (default: 1000)
- `AI_TEMPERATURE`: Creativity level 0-1 (default: 0.7)

### Rate Limiting
- `AI_RATE_LIMIT_PER_HOUR`: Requests per hour per user (default: 50)
- `AI_RATE_LIMIT_PER_DAY`: Requests per day per user (default: 200)

## Troubleshooting

### Common Issues

1. **"AI service is currently unavailable"**
   - Check if Google API key is correctly set
   - Verify API key has sufficient quota
   - Check network connectivity

2. **Rate limit exceeded**
   - Wait for the rate limit window to reset
   - Adjust rate limiting settings in .env

3. **Authentication errors**
   - Ensure user is logged in
   - Check JWT token validity

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages in API responses.

## Cost Considerations

- Google AI API charges per token usage
- Monitor usage in Google Cloud Console
- Consider implementing usage tracking
- Set appropriate rate limits to control costs

## Security Notes

- All AI endpoints require authentication
- Rate limiting prevents abuse
- API keys should be kept secure
- Consider implementing user-specific usage quotas

## Future Enhancements

- Support for multiple AI providers (Anthropic, Google AI)
- Custom AI prompts per category
- AI-powered idea categorization
- Sentiment analysis for comments
- AI-generated idea summaries
