# ParenticAI - AI-Powered Parenting Assistant

ParenticAI is a frontend-only web application that provides AI-powered parenting assistance through an intelligent chat interface. Built with React, TypeScript, Material-UI, Firebase Authentication, and DeepSeek API integration.

## 🚀 Features

- **🔐 Secure Authentication**: Firebase Authentication for secure user management
- **🤖 AI Chat Assistant**: DeepSeek API powered conversational AI for parenting advice
- **🎨 Modern UI**: Beautiful, responsive design with Material-UI
- **📱 Frontend Only**: No backend services required - all AI calls via Vercel serverless functions

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
- Vercel serverless functions for API proxy

## 🔧 Prerequisites

- Git
- Node.js 18+ and npm (for local development)
- DeepSeek API Key (get one at https://platform.deepseek.com/)
- Firebase project (for authentication)
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ParenticAI-Beta
git checkout frontend-deepseek-integration
```

### 2. Local Development Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
REACT_APP_DEEPSEEK_API_KEY=your-deepseek-api-key-here
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

Start the development server:
```bash
npm start
```

The app will be available at http://localhost:3000

### 3. Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions to Vercel.

## ⚙️ Configuration

### Environment Variables

All required environment variables are listed in [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).

**Required:**
- `DEEPSEEK_API_KEY` - DeepSeek API key for LLM
- `REACT_APP_FIREBASE_API_KEY` - Firebase API key
- `REACT_APP_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `REACT_APP_FIREBASE_PROJECT_ID` - Firebase project ID
- `REACT_APP_FIREBASE_APP_ID` - Firebase app ID

**Optional (Recommended):**
- `REACT_APP_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `REACT_APP_FIREBASE_APP_ID` - Firebase app ID
- `REACT_APP_FIREBASE_MEASUREMENT_ID` - Firebase analytics measurement ID

## 🚀 Deployment Architecture

| Component | Description |
|-----------|-------------|
| Frontend | React static files served by Vercel |
| Serverless Function | `/api/chat` - Proxies DeepSeek API calls securely |
| DeepSeek API | External LLM service (called via serverless function) |
| Firebase | Authentication and user management |

## 🤖 AI Integration

### DeepSeek API
- Cloud-based AI service
- No local model setup required
- Fast response times
- Uses `deepseek-chat` model
- Configured with appropriate temperature (0.7) and max tokens (2000) for parenting advice

### API Security
The DeepSeek API key is kept secure in Vercel serverless functions, never exposed to the client-side code.

## 🛠️ Development

### Building for Production
```bash
cd frontend
npm run build
```

The built static files will be in the `build/` directory.

### Running Tests
```bash
cd frontend
npm test
```

## ⚠️ Important Notes

### Backend-Dependent Features
Some features in the frontend code depend on backend APIs that are no longer available:
- User profile management (via `api.ts`)
- Children profile management
- Community messages
- Chat history persistence

These features will show errors if accessed. Only the **AI Chat** functionality works with DeepSeek integration.

## 🚨 Troubleshooting

### DeepSeek API Key Not Working
- Verify your API key is correct
- Check that the key has sufficient credits/quota
- Ensure the environment variable is set correctly in Vercel
- Check browser console and Vercel function logs for API errors

### Frontend Not Loading
- Check Vercel deployment logs in the dashboard
- Verify build completed successfully
- Check browser console for errors
- Verify environment variables are set correctly in Vercel

### Firebase Authentication Not Working
- Verify Firebase environment variables are set correctly
- Check Firebase Console → Authentication → Authorized domains (add your Vercel domain)
- Ensure Firebase project has authentication enabled
- Check browser console for Firebase errors

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide for Vercel
- **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - Environment variables setup guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Troubleshooting common issues

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
