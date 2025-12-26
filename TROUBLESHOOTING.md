# Troubleshooting Guide

This guide helps you resolve common issues when deploying and running ParenticAI.

## Firebase Errors

### auth/unauthorized-domain Error (Google/Phone Authentication)

**Error:**
```
Firebase: Error (auth/unauthorized-domain)
```

**Cause:** The domain where your app is running is not authorized in Firebase Console. This happens when you try to use Google Sign-In or Phone Authentication from a domain that Firebase doesn't recognize.

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** (gear icon)
4. Scroll down to **Authorized domains** section
5. Click **Add domain**
6. Add your production domain(s):
   - `www.parenticai.com` (if using www subdomain)
   - `parenticai.com` (if using root domain)
   - Any other domains where your app is hosted
7. For **local development**, make sure `localhost` is in the list (it should be there by default)
8. Click **Add** to save
9. **Important:** Changes may take a few minutes to propagate

**Common Domains to Add:**
- Production: `www.parenticai.com`, `parenticai.com`
- Preview/Staging: Your Vercel preview URLs (e.g., `your-app-git-branch.vercel.app`)
- Local: `localhost` (usually already added)

**Note:** If you're testing on a Vercel preview URL, you may need to add that specific preview domain, or use the wildcard pattern if Firebase supports it.

### 403 PERMISSION_DENIED: Installations

**Error:**
```
FirebaseError: Installations: Create Installation request failed with error "403 PERMISSION_DENIED: The caller does not have permission"
```

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Make sure your web app is properly registered
6. Verify the `appId` matches exactly in your environment variables
7. If the error persists, try recreating the web app in Firebase Console

### 404 App Not Found

**Error:**
```
FirebaseError: Analytics: Dynamic config fetch failed: [404] App not found. App [1:123456789:web:abc123def456]
```

**Cause:** You're using example/placeholder Firebase App ID values instead of your actual values.

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Project Settings**
3. Scroll to **Your apps** section
4. Click on your web app
5. Copy the **actual** `appId` value (it should look like: `1:335828509209:web:7bd7ceb1cb0afe92780088`)
6. Update your environment variable `REACT_APP_FIREBASE_APP_ID` with the real value
7. **Important:** Never use example values like `1:123456789:web:abc123def456` - these are just documentation placeholders

### Firebase Configuration Not Loading

**Error:**
```
Missing required Firebase environment variables
```

**Solution:**
1. Verify all required environment variables are set:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_APP_ID`

2. For **local development:**
   - Create `.env` file in `frontend/` directory
   - Add all Firebase environment variables
   - Restart development server

3. For **Vercel deployment:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify all variables are set
   - Make sure variables are set for all environments (Production, Preview, Development)
   - Redeploy after adding/updating variables

### Firestore "Client is offline" Error

**Error:**
```
FirebaseError: Failed to get document because the client is offline
```

**Solutions:**
1. **Check Firebase Project Settings:**
   - Ensure Firestore Database is enabled
   - Go to Firebase Console → Firestore Database
   - If not enabled, click "Create database"

2. **Check Firestore Security Rules:**
   - Go to Firebase Console → Firestore Database → Rules
   - Ensure rules allow authenticated users:
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

3. **Check Network Connection:**
   - Verify your internet connection
   - Check if Firebase services are accessible

## API Errors

### 500 Internal Server Error on /api/chat

**Error:**
```
POST https://your-domain.com/api/chat 500 (Internal Server Error)
```

**Solutions:**
1. **Check DEEPSEEK_API_KEY:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `DEEPSEEK_API_KEY` is set correctly
   - Ensure it starts with `sk-`
   - Verify the key has sufficient credits/quota

2. **Check Serverless Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions tab
   - Click on `/api/chat`
   - View logs to see specific error messages
   - Common issues:
     - Missing API key
     - Invalid API key
     - API key quota exceeded
     - Network timeout

3. **Test DeepSeek API Directly:**
   ```bash
   curl https://api.deepseek.com/chat/completions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -d '{
       "model": "deepseek-chat",
       "messages": [{"role": "user", "content": "Hello"}]
     }'
   ```

4. **Verify Function Deployment:**
   - Check that `frontend/api/chat.ts` exists
   - Verify the function is deployed (check Functions tab in Vercel)
   - Redeploy if function is missing

## Build Errors

### Build Fails on Vercel

**Common Causes:**

1. **TypeScript Errors:**
   - Check build logs in Vercel
   - Fix TypeScript errors locally first
   - Run `npm run build` locally to catch errors

2. **Missing Dependencies:**
   - Verify `package.json` has all required dependencies
   - Run `npm install` locally to ensure lockfile is up to date
   - Commit `package-lock.json`

3. **Environment Variables:**
   - Some builds fail if required env vars are missing
   - Check build logs for specific error messages

## Authentication Issues

### Firebase Authentication Not Working

**Symptoms:**
- Login/signup buttons don't work
- Users can't authenticate
- Redirect issues

**Solutions:**
1. **Check Authorized Domains:**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel domain: `your-app.vercel.app`
   - Add your custom domain if using one
   - Remove `localhost` restrictions if testing locally

2. **Verify Authentication Method:**
   - Go to Firebase Console → Authentication → Sign-in method
   - Ensure "Email/Password" is enabled
   - Check if other sign-in methods are properly configured

3. **Check Browser Console:**
   - Open browser DevTools → Console
   - Look for Firebase-related errors
   - Check Network tab for failed requests

## Domain and DNS Issues

### Custom Domain Not Working

**Solutions:**
1. **Check DNS Configuration:**
   - Verify DNS records are correctly set
   - Use `dig yourdomain.com` or online DNS checker
   - Wait up to 24 hours for DNS propagation

2. **Check Vercel Domain Status:**
   - Go to Vercel Dashboard → Settings → Domains
   - Verify domain status shows "Valid Configuration"
   - Check for error messages

3. **SSL Certificate:**
   - Vercel automatically provisions SSL
   - Wait a few minutes after adding domain
   - Check if certificate is issued (green lock icon)

## Performance Issues

### Slow API Responses

**Solutions:**
1. **Check DeepSeek API Status:**
   - Visit DeepSeek status page or dashboard
   - Check if there are any service issues

2. **Monitor Function Execution Time:**
   - Check Vercel Functions tab → Logs
   - Look for timeout errors
   - Consider increasing function timeout if needed

3. **Check Network Latency:**
   - Use browser DevTools → Network tab
   - Check response times for API calls

## Quick Diagnostic Checklist

Run through this checklist when troubleshooting:

- [ ] All required environment variables are set in Vercel
- [ ] Environment variables use real values (not placeholders)
- [ ] Firebase App ID matches exactly from Firebase Console
- [ ] Firebase Authorized Domains include your Vercel domain
- [ ] Firestore Database is enabled in Firebase Console
- [ ] Firestore Security Rules allow authenticated access
- [ ] DeepSeek API key is valid and has credits
- [ ] Serverless function `/api/chat` is deployed
- [ ] Custom domain DNS is properly configured
- [ ] SSL certificate is issued for custom domain
- [ ] Browser console shows no blocking errors
- [ ] Network requests are completing successfully

## Getting Help

If you've tried all troubleshooting steps:

1. **Check Logs:**
   - Vercel function logs
   - Browser console logs
   - Network request responses

2. **Verify Configuration:**
   - Compare your env vars with documentation
   - Double-check Firebase Console settings
   - Verify API keys are active

3. **Test Locally:**
   - Try running locally with `.env` file
   - This helps isolate if issue is deployment-specific

4. **Review Documentation:**
   - Check [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Check [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)

---

**Note:** Most errors are caused by missing or incorrect environment variables. Always verify these first!

