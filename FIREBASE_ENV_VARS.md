# Firebase Environment Variables

This document lists all Firebase environment variables needed for the ParenticAI application.

## Required Environment Variables

You must set these in your Vercel dashboard (Settings → Environment Variables):

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyBY8EvZa4Ttwh93RxLftRzGjPeLlGkUTVA` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `parenticai-auth.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase Project ID | `parenticai-auth` |

## Optional Environment Variables

These are optional but recommended:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `parenticai-auth.firebasestorage.app` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `335828509209` |
| `REACT_APP_FIREBASE_APP_ID` | Firebase App ID | `1:335828509209:web:7bd7ceb1cb0afe92780088` |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Firebase Analytics Measurement ID | `G-HJMPS85E4M` |

## How to Get These Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on your web app (or create one by clicking the web icon `</>`)
7. You'll see the Firebase configuration object with all these values

## Example Configuration Object

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

## Mapping to Environment Variables

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
   - **Value**: The actual value from Firebase
   - **Environment**: Select all three (Production, Preview, Development)
4. Click **Save**
5. Redeploy your application for changes to take effect

## For Local Development

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important**: Never commit the `.env` file to version control! It should already be in `.gitignore`.

## Current Hardcoded Values (Before Migration)

These were the previously hardcoded values (now removed):

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

1. Redeploy your application on Vercel
2. Check the browser console for any Firebase configuration errors
3. Test Firebase authentication (login/signup)
4. Verify that Firestore operations work correctly

If you see errors about missing Firebase configuration, double-check that:
- All required environment variables are set
- Variable names match exactly (case-sensitive)
- You've redeployed after adding variables
- Variables are set for the correct environment (Production/Preview/Development)

