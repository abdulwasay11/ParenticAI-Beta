# Quick Vercel UI Setup Steps

This is a quick reference guide for the Vercel UI setup. For detailed instructions, see `VERCEL_DEPLOYMENT_GUIDE.md`.

## Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Import your Git repository
4. If repo not visible, click **"Adjust GitHub App Permissions"** and authorize Vercel

## Step 2: Configure Project

### Basic Settings
- **Framework Preset**: Should auto-detect "Create React App"
- **Root Directory**: 
  - If deploying from root: Leave default or set to `frontend`
  - If deploying from `frontend` folder: Set to `./` (current directory)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `build` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**Important**: If your repository root contains both `frontend` and other folders, set:
- **Root Directory**: `frontend`

## Step 3: Add Environment Variables

Click **"Environment Variables"** section and add:

### Required Variables

#### 1. DeepSeek API Key

| Key | Value | Environments |
|-----|-------|--------------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key (starts with `sk-`) | ✅ Production<br>✅ Preview<br>✅ Development |

#### 2. Firebase Configuration (Required)

| Key | Value | Environments |
|-----|-------|--------------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase API Key | ✅ Production<br>✅ Preview<br>✅ Development |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | ✅ Production<br>✅ Preview<br>✅ Development |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase Project ID | ✅ Production<br>✅ Preview<br>✅ Development |

#### 3. Firebase Configuration (Optional but Recommended)

| Key | Value | Environments |
|-----|-------|--------------|
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | ✅ Production<br>✅ Preview<br>✅ Development |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | ✅ Production<br>✅ Preview<br>✅ Development |
| `REACT_APP_FIREBASE_APP_ID` | Firebase App ID | ✅ Production<br>✅ Preview<br>✅ Development |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Firebase Analytics Measurement ID | ✅ Production<br>✅ Preview<br>✅ Development |

**How to add:**
1. Click **"Add"** button for each variable
2. **Key**: The variable name (e.g., `DEEPSEEK_API_KEY`)
3. **Value**: Paste the actual value
4. **Environment**: Select all three checkboxes (Production, Preview, Development)
5. Click **"Save"**

**Note**: See `FIREBASE_ENV_VARS.md` for detailed instructions on how to get Firebase configuration values.

## Step 4: Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. You'll see a success message with deployment URL

## Step 5: Configure Custom Domain (Optional)

1. In your project dashboard, go to **Settings** → **Domains**
2. Click **"Add"** button
3. Enter your domain (e.g., `parenticai.com`)
4. Click **"Add"**
5. Follow DNS instructions shown by Vercel:
   - Add CNAME record: `@` → `cname.vercel-dns.com`
   - OR add A records if preferred
6. Wait for DNS propagation (few minutes to hours)
7. SSL certificate is automatically provisioned

## Quick Checklist

Before deploying:
- [ ] Repository is connected
- [ ] Root directory is set correctly (if needed)
- [ ] `DEEPSEEK_API_KEY` environment variable is added
- [ ] All environments are selected for the API key

After deploying:
- [ ] Deployment is successful (green checkmark)
- [ ] Visit deployment URL and test chat
- [ ] Check Functions tab to see `/api/chat` function
- [ ] Test Firebase login/signup
- [ ] If using custom domain, verify DNS and SSL

## Common Issues

**Build fails?**
- Check Root Directory setting
- Verify `package.json` exists in root directory
- Check build logs for errors

**API calls fail?**
- Verify `DEEPSEEK_API_KEY` is set
- Check Functions tab → `/api/chat` → Logs
- Ensure API key is valid and has credits

**Can't see repository?**
- Authorize Vercel GitHub App
- Check repository is not private (or upgrade Vercel plan)
- Try disconnecting and reconnecting GitHub

---

That's it! Your app should now be live on Vercel. 🚀

