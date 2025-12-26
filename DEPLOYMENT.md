# Vercel Deployment Guide

This guide will walk you through deploying ParenticAI to Vercel with DeepSeek API integration and Firebase authentication.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A DeepSeek API key (get one at [platform.deepseek.com](https://platform.deepseek.com))
3. A Firebase project (see [Firebase Setup](#firebase-setup) section)

## Quick Setup Steps

### Step 1: Connect Repository

1. **Log in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub, GitLab, or Bitbucket account

2. **Create a New Project**
   - Click the **"Add New"** button
   - Select **"Project"**
   - Import your Git repository
   - If your repository isn't listed, click **"Adjust GitHub App Permissions"** and authorize Vercel

### Step 2: Configure Project

- **Framework Preset**: Vercel should auto-detect "Create React App"
- **Root Directory**: 
  - If your repository root contains a `frontend` folder, set to `frontend`
  - If deploying from the frontend folder directly, leave as default
- **Build Command**: `npm run build` (should be auto-detected)
- **Output Directory**: `build` (should be auto-detected)
- **Install Command**: `npm install` (should be auto-detected)

### Step 3: Configure Environment Variables

Click on **"Environment Variables"** and add the following. See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for detailed instructions.

#### Required Variables

1. **DEEPSEEK_API_KEY**
   - **Value**: Your DeepSeek API key (e.g., `sk-...`)
   - **Environment**: Select all (Production, Preview, Development)
   - **Description**: API key for DeepSeek LLM service

2. **Firebase Configuration (Required)**
   - `REACT_APP_FIREBASE_API_KEY` - Firebase API Key
   - `REACT_APP_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain
   - `REACT_APP_FIREBASE_PROJECT_ID` - Firebase Project ID
   - `REACT_APP_FIREBASE_APP_ID` - Firebase App ID
   - **Environment**: Select all (Production, Preview, Development)

#### Optional Variables (Recommended)

- `REACT_APP_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
- `REACT_APP_FIREBASE_MEASUREMENT_ID` - Firebase Analytics Measurement ID
- **Environment**: Select all (Production, Preview, Development)

**How to add each variable:**
1. Click **"Add"** button
2. **Key**: The variable name (e.g., `DEEPSEEK_API_KEY`)
3. **Value**: Paste the actual value
4. **Environment**: Select all three checkboxes (Production, Preview, Development)
5. Click **"Save"**

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployment is successful, you'll see a deployment URL like `parentic-ai-frontend.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. **Go to Project Settings**
   - Click on your project name in the dashboard
   - Navigate to **Settings** → **Domains**

2. **Add Your Domain**
   - Click **"Add"** button
   - Enter your domain name (e.g., `parenticai.com` or `www.parenticai.com`)
   - Click **"Add"**

3. **Configure DNS Records**
   - Vercel will show you DNS records to add
   - You have two options:
     - **Option A - CNAME (Recommended)**: Add a CNAME record pointing to Vercel
     - **Option B - A Record**: Add A records pointing to Vercel's IP addresses
   
   **Example DNS Configuration:**
   ```
   Type: CNAME
   Name: @ (or www)
   Value: cname.vercel-dns.com
   ```

4. **Wait for DNS Propagation**
   - DNS changes can take a few minutes to several hours to propagate
   - Vercel will automatically detect when DNS is configured correctly
   - You'll see a green checkmark when the domain is ready

5. **SSL Certificate**
   - Vercel automatically provisions SSL certificates via Let's Encrypt
   - Your site will be accessible via HTTPS automatically

## Firebase Setup

If you haven't set up Firebase yet, follow these steps:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `parentic-ai` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

### 3. Create Web App

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`)
5. Enter app nickname: `parentic-ai-web`
6. Click "Register app"
7. Copy the Firebase configuration object

### 4. Get Firebase Configuration Values

The configuration will look like this:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "G-XXXXXXXXXX"
};
```

Map these to environment variables (see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md))

### 5. Set Up Firestore Database (Optional but Recommended)

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in production mode
4. Choose a location close to your users
5. Click "Enable"

### 6. Configure Firestore Security Rules

Update Firestore security rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Add Authorized Domains

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain (e.g., `your-app.vercel.app`)
3. Add your custom domain if using one

## Verify Deployment

1. **Test the Application**
   - Visit your deployment URL
   - Test the AI chat functionality
   - Test Firebase authentication (login/signup)

2. **Check Serverless Function Logs**
   - Go to your project dashboard
   - Click on **"Functions"** tab
   - Click on `/api/chat` to see function logs
   - Test a chat message and verify logs show successful API calls

3. **Monitor API Usage**
   - Check your DeepSeek dashboard to monitor API usage
   - Set up billing alerts if needed

## Troubleshooting

### Build Fails

1. **Check Build Logs**
   - Click on the failed deployment
   - Review the build logs for errors
   - Common issues:
     - Missing dependencies
     - TypeScript errors
     - Environment variable not set

2. **Common Solutions**
   - Ensure all dependencies are in `package.json`
   - Fix any TypeScript/linting errors
   - Verify environment variables are set correctly

### API Calls Fail (500 Errors)

1. **Check Function Logs**
   - Go to Functions tab in Vercel dashboard
   - Check `/api/chat` function logs
   - Look for error messages

2. **Verify Environment Variables**
   - Ensure `DEEPSEEK_API_KEY` is set correctly
   - Check that the API key is valid and has credits
   - Verify the key is added to all environments

3. **Test DeepSeek API Directly**
   - Use curl or Postman to test your DeepSeek API key
   - Verify the key works outside of Vercel

### CORS Errors

- The serverless function includes CORS headers
- If you still see CORS errors, check that the function is correctly deployed
- Verify the `/api/chat` endpoint is accessible

### Firebase Authentication Not Working

1. **Check Firebase Configuration**
   - Verify Firebase config environment variables are set
   - Ensure Firebase project has authentication enabled
   - Check Firebase console for any errors

2. **Authorized Domains**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel domain (e.g., `your-app.vercel.app`)
   - Add your custom domain if using one

### Domain Not Working

1. **Check DNS Configuration**
   - Verify DNS records are correctly set
   - Use `dig` or online DNS checker to verify propagation
   - Wait up to 24 hours for full propagation

2. **Check Vercel Domain Status**
   - Go to Settings → Domains
   - Verify domain status shows "Valid Configuration"
   - Check for any error messages

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Application builds successfully
- [ ] AI chat functionality works
- [ ] Firebase authentication works (login/signup)
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active (automatic)
- [ ] Function logs show successful API calls
- [ ] Firebase authorized domains include your Vercel domain
- [ ] Test on mobile devices
- [ ] Monitor DeepSeek API usage and costs

## Cost Considerations

1. **Vercel**
   - Free tier: 100GB bandwidth, 100 serverless function executions/day
   - Pro tier: $20/month for unlimited bandwidth and functions

2. **DeepSeek API**
   - Pay-per-use pricing
   - Monitor usage in DeepSeek dashboard
   - Set up billing alerts

3. **Firebase**
   - Free tier includes authentication for up to 50,000 users
   - Firestore has generous free tier limits

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [DeepSeek API Documentation](https://api-docs.deepseek.com)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Note**: This deployment configuration uses Vercel serverless functions to securely proxy DeepSeek API calls, keeping your API key safe on the server-side.

