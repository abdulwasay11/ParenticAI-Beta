# Environment Variables Guide

This document lists all environment variables needed for the ParenticAI application and how to configure them.

## Required Environment Variables

You must set these in your Vercel dashboard (Settings → Environment Variables) for production deployment:

### DeepSeek API

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `DEEPSEEK_API_KEY` | DeepSeek API key for LLM service | `sk-...` (starts with `sk-`) |

**How to get:**
1. Visit https://platform.deepseek.com/
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key
5. Copy the key

### Firebase Authentication (Required)

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase API Key | `AIzaSy...` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `REACT_APP_FIREBASE_APP_ID` | Firebase App ID | `1:123456789:web:abc123def456` |

## Optional Environment Variables (Recommended)

These are optional but recommended for full functionality:

### Firebase (Optional but Recommended)

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project.appspot.com` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789` |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Firebase Analytics Measurement ID | `G-XXXXXXXXXX` |

## How to Get Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on your web app (or create one by clicking the web icon `</>`)
7. You'll see the Firebase configuration object with all these values

### Example Firebase Configuration Object

When you view your Firebase config, it will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
  measurementId: "G-XXXXXXXXXX"
};
```

### Mapping to Environment Variables

Map the Firebase config to environment variables like this:

```
REACT_APP_FIREBASE_API_KEY = apiKey
REACT_APP_FIREBASE_AUTH_DOMAIN = authDomain
REACT_APP_FIREBASE_PROJECT_ID = projectId
REACT_APP_FIREBASE_STORAGE_BUCKET = storageBucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = messagingSenderId
REACT_APP_FIREBASE_APP_ID = appId
REACT_APP_FIREBASE_MEASUREMENT_ID = measurementId
```

## Setting in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: The variable name (e.g., `REACT_APP_FIREBASE_API_KEY`)
   - **Value**: The actual value from Firebase or DeepSeek
   - **Environment**: Select all three (Production, Preview, Development)
4. Click **Save**
5. Redeploy your application for changes to take effect

## For Local Development

Create a `.env` file in the `frontend` directory:

```env
# DeepSeek API
REACT_APP_DEEPSEEK_API_KEY=your-deepseek-api-key-here

# Firebase Configuration (Required)
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Configuration (Optional but Recommended)
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important**: 
- Never commit the `.env` file to version control! It should already be in `.gitignore`.
- Note that `DEEPSEEK_API_KEY` is for serverless functions (used in `frontend/api/chat.ts`), not `REACT_APP_DEEPSEEK_API_KEY`

## Previous Hardcoded Values (Reference)

These were the previously hardcoded Firebase values (now removed and moved to environment variables):

- API Key: `AIzaSyBY8EvZa4Ttwh93RxLftRzGjPeLlGkUTVA`
- Auth Domain: `parenticai-auth.firebaseapp.com`
- Project ID: `parenticai-auth`
- Storage Bucket: `parenticai-auth.firebasestorage.app`
- Messaging Sender ID: `335828509209`
- App ID: `1:335828509209:web:7bd7ceb1cb0afe92780088`
- Measurement ID: `G-HJMPS85E4M`

If you want to use these same values, copy them to your Vercel environment variables.

## Verification

After setting environment variables:

1. **For Vercel Deployment:**
   - Redeploy your application on Vercel
   - Check the browser console for any Firebase configuration errors
   - Test Firebase authentication (login/signup)
   - Verify that Firestore operations work correctly
   - Check Vercel function logs for `/api/chat` to verify DeepSeek API calls

2. **For Local Development:**
   - Restart your development server after creating/updating `.env`
   - Check browser console for any configuration errors
   - Test Firebase authentication
   - Test AI chat functionality

## Troubleshooting

If you see errors about missing configuration, double-check that:

- All required environment variables are set
- Variable names match exactly (case-sensitive)
- You've redeployed after adding variables (for Vercel)
- Variables are set for the correct environment (Production/Preview/Development in Vercel)
- For local development, you've restarted the dev server after updating `.env`

## Environment Variable Summary Table

| Variable | Type | Required | Where to Set |
|----------|------|----------|--------------|
| `DEEPSEEK_API_KEY` | Serverless Function | ✅ Yes | Vercel Environment Variables |
| `REACT_APP_FIREBASE_API_KEY` | Frontend | ✅ Yes | Vercel + Local `.env` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Frontend | ✅ Yes | Vercel + Local `.env` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Frontend | ✅ Yes | Vercel + Local `.env` |
| `REACT_APP_FIREBASE_APP_ID` | Frontend | ✅ Yes | Vercel + Local `.env` |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Frontend | ⚠️ Recommended | Vercel + Local `.env` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Frontend | ⚠️ Recommended | Vercel + Local `.env` |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Frontend | ⚠️ Recommended | Vercel + Local `.env` |

