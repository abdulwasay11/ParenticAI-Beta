# Vercel Deployment Guide for ParenticAI

This guide will walk you through deploying ParenticAI frontend to Vercel with DeepSeek API integration and Firebase authentication.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A DeepSeek API key (get one at [platform.deepseek.com](https://platform.deepseek.com))
3. A Firebase project (already configured in the code)

## Step-by-Step Deployment Instructions

### Step 1: Prepare Your Repository

1. Make sure all changes are committed to your repository:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin frontend-deepseek-integration
   ```

### Step 2: Connect Your Repository to Vercel

1. **Log in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub, GitLab, or Bitbucket account

2. **Create a New Project**
   - Click the **"Add New"** button
   - Select **"Project"**
   - Import your Git repository
   - If your repository isn't listed, click **"Adjust GitHub App Permissions"** and authorize Vercel

3. **Configure the Project**
   - **Framework Preset**: Vercel should auto-detect "Create React App"
   - **Root Directory**: Leave as default (or set to `frontend` if deploying from monorepo root)
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `build` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)

### Step 3: Configure Environment Variables

This is the most important step! Click on **"Environment Variables"** and add the following:

#### Required Environment Variable

1. **DEEPSEEK_API_KEY**
   - **Value**: Your DeepSeek API key (e.g., `sk-...`)
   - **Environment**: Select all (Production, Preview, Development)
   - **Description**: API key for DeepSeek LLM service

#### Optional: Firebase Environment Variables

Your Firebase configuration is already hardcoded in the code, but if you want to use environment variables instead (recommended for production), you can add:

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_MEASUREMENT_ID`

**Note**: Make sure to add the same variables to all environments (Production, Preview, Development) unless you want different values for each.

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

### Step 6: Verify Deployment

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
   - Verify Firebase config in `src/config/firebase.ts`
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

## Environment Variables Summary

### Required for Production

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `DEEPSEEK_API_KEY` | DeepSeek API key for LLM | [platform.deepseek.com](https://platform.deepseek.com) |

### Already Configured (Hardcoded)

The following Firebase variables are already in the code, but you can override them with environment variables if needed:

- Firebase API Key
- Firebase Auth Domain
- Firebase Project ID
- Firebase Storage Bucket
- Firebase Messaging Sender ID
- Firebase App ID
- Firebase Measurement ID

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

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check serverless function logs
3. Review this guide's troubleshooting section
4. Check Vercel status page
5. Contact Vercel support if needed

---

**Note**: This deployment configuration uses Vercel serverless functions to securely proxy DeepSeek API calls, keeping your API key safe on the server-side.

