# ParenticAI Frontend

This is the React frontend for ParenticAI, configured for deployment on Vercel with DeepSeek API integration.

## Build Process

The frontend is configured to build static files that are served by Vercel:

1. **Development**: Uses React development server for local development
2. **Production**: Builds static files optimized for production deployment on Vercel

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Vercel account (for deployment)

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at http://localhost:3000

### Building for Production

```bash
# Build static files
npm run build

# The build output will be in the 'build' directory
```

### Using Build Scripts

**Windows:**
```bash
# Build static files
build.bat
```

**Linux/Mac:**
```bash
# Make script executable
chmod +x build.sh

# Build static files
./build.sh
```

## Vercel Deployment

This frontend is configured for deployment on Vercel:

1. **Static Files**: React app is built to static files served by Vercel
2. **Serverless Functions**: `/api/chat` function proxies DeepSeek API calls
3. **Environment Variables**: Set in Vercel dashboard

See `../VERCEL_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## Environment Variables

### Required for Production (Vercel)
- `DEEPSEEK_API_KEY`: DeepSeek API key for LLM (set in Vercel dashboard)

### For Local Development
Create a `.env` file in the frontend directory:
```env
REACT_APP_DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

### Firebase Configuration
Firebase configuration uses environment variables. See `../FIREBASE_ENV_VARS.md` for complete instructions on setting up Firebase environment variables.

## File Structure

```
frontend/
├── api/                    # Vercel serverless functions
│   └── chat.ts            # DeepSeek API proxy
├── public/                 # Static assets
├── src/                    # React source code
│   ├── components/        # React components
│   ├── config/            # Configuration files
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   └── utils/             # Utility functions
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## Features

- React 18 with TypeScript
- Material-UI for components
- Firebase Authentication
- DeepSeek API integration via serverless function
- React Router for navigation
- Responsive design

## Development

### Running Tests
```bash
npm test
```

### Type Checking
```bash
# TypeScript will check types during build
npm run build
```

## Deployment

Deploy to Vercel using:
- Vercel CLI: `vercel`
- GitHub integration: Connect repository in Vercel dashboard
- See `../VERCEL_DEPLOYMENT_GUIDE.md` for details
