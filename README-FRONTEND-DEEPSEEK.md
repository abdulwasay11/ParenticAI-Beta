# ParenticAI - Frontend Only with DeepSeek Integration

This branch contains a frontend-only version of ParenticAI that uses the DeepSeek API directly for LLM inference, eliminating the need for a local backend.

## 🚀 Features

- **🔐 Secure Authentication**: Firebase Authentication for secure user management
- **🤖 AI Chat Assistant**: DeepSeek API powered conversational AI for parenting advice
- **🎨 Modern UI**: Beautiful, responsive design with Material-UI
- **📱 Frontend Only**: No backend services required - all AI calls go directly to DeepSeek API

## 🏗️ Architecture

### Services
- **Frontend**: React 18 with TypeScript, Material-UI
- **AI Model**: DeepSeek API (cloud-based, no local setup needed)
- **Authentication**: Firebase Authentication
- **Hosting**: Vercel (serverless functions and static hosting)

### Tech Stack

#### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for components
- React Router for navigation
- Firebase for authentication
- Direct DeepSeek API integration

## 🔧 Prerequisites

- Git
- Node.js 18+ and npm (for local development)
- DeepSeek API Key (get one at https://platform.deepseek.com/)
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ParenticAI-Beta
git checkout frontend-deepseek-integration
```

### 2. Set Up Environment Variables

For local development, create a `.env` file in the frontend directory:
```env
REACT_APP_DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

**Note**: For production deployment on Vercel, you'll set environment variables in the Vercel dashboard (see deployment guide).

### 3. Local Development

```bash
cd frontend
npm install
npm start
```

This will start the development server at http://localhost:3000

### 4. Deploy to Vercel

See `VERCEL_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## ⚙️ Configuration

### Environment Variables

#### Required
- `REACT_APP_DEEPSEEK_API_KEY`: Your DeepSeek API key (required for AI chat)
- `REACT_APP_FIREBASE_API_KEY`: Firebase API key (required)
- `REACT_APP_FIREBASE_AUTH_DOMAIN`: Firebase auth domain (required)
- `REACT_APP_FIREBASE_PROJECT_ID`: Firebase project ID (required)

#### Optional (Firebase - Recommended)
- `REACT_APP_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `REACT_APP_FIREBASE_APP_ID`: Firebase app ID
- `REACT_APP_FIREBASE_MEASUREMENT_ID`: Firebase measurement ID

All environment variables should be set in the Vercel dashboard (Settings → Environment Variables) for production deployment.

**See `FIREBASE_ENV_VARS.md` for detailed instructions on how to get Firebase configuration values.**

### Getting a DeepSeek API Key

1. Visit https://platform.deepseek.com/
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key
5. Copy the key and add it to your environment variables

## 🚀 Deployment Architecture

| Component | Description |
|-----------|-------------|
| Frontend | React static files served by Vercel |
| Serverless Function | `/api/chat` - Proxies DeepSeek API calls |
| DeepSeek API | External LLM service (called via serverless function) |

## 🤖 AI Integration

### DeepSeek API
- Cloud-based AI service
- No local model setup required
- Fast response times
- Uses `deepseek-chat` model
- Configured with appropriate temperature and max tokens for parenting advice

### API Configuration
The frontend makes direct calls to:
- **Endpoint**: `https://api.deepseek.com/chat/completions`
- **Model**: `deepseek-chat`
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 2000

## 🛠️ Development

### Frontend Development

#### Development Mode
```bash
cd frontend
npm install
REACT_APP_DEEPSEEK_API_KEY=your-key npm start
```

#### Production Build
```bash
cd frontend
npm install
REACT_APP_DEEPSEEK_API_KEY=your-key npm run build
```

The built static files will be in the `build/` directory.

## ⚠️ Important Notes

### Backend-Dependent Features
Some features in the frontend code depend on backend APIs that are no longer available:
- User profile management (via `api.ts`)
- Children profile management
- Community messages
- Chat history persistence

These features will show errors if accessed. Only the **AI Chat** functionality works with DeepSeek integration.

### Migration from Backend Version
If you're migrating from the full-stack version:
1. The backend directory has been removed
2. All database services (PostgreSQL, ChromaDB) have been removed
3. Ollama service has been removed
4. Docker and nginx configurations have been removed
5. AI chat now uses DeepSeek API via Vercel serverless functions
6. Deployment is now handled entirely by Vercel

## 🚨 Troubleshooting

### DeepSeek API Key Not Working
- Verify your API key is correct
- Check that the key has sufficient credits/quota
- Ensure the environment variable is set correctly
- Check browser console for API errors

### Frontend Not Loading
- Check Vercel deployment logs in the dashboard
- Verify build completed successfully
- Check browser console for errors
- Verify environment variables are set correctly in Vercel

### CORS Issues
- DeepSeek API should handle CORS automatically
- If issues occur, check browser console for specific errors

## 🔒 Security Considerations

- **Never commit API keys to version control**
- Use environment variables for all sensitive data
- Set up proper CORS settings if needed
- Use SSL/TLS for production deployments
- Regularly rotate API keys

## 🚀 Production Deployment

### Environment Setup
1. Set DeepSeek API key in Vercel dashboard (Environment Variables)
2. Configure custom domain in Vercel (SSL is automatic)
3. Set up proper CORS if needed (already configured in serverless function)
4. Monitor API usage and costs in DeepSeek dashboard
5. Set up Vercel deployment previews for testing

### Cost Considerations
- DeepSeek API is pay-per-use
- Monitor your API usage to control costs
- Consider implementing rate limiting if needed
- Set up billing alerts

## 📝 API Usage

The frontend makes direct API calls to DeepSeek. Example request:

```javascript
fetch('https://api.deepseek.com/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are a helpful parenting assistant.' },
      { role: 'user', content: 'How do I handle tantrums?' }
    ],
    stream: false,
    temperature: 0.7,
    max_tokens: 2000
  })
})
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch from `frontend-deepseek-integration`
3. Make your changes
4. Test with DeepSeek API
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for parents everywhere by the ParenticAI team.

