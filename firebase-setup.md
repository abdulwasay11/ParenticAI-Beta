# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for ParenticAI, replacing the previous Keycloak authentication system.

## 🚀 Quick Setup

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
4. Click the web icon (</>)
5. Enter app nickname: `parentic-ai-web`
6. Click "Register app"
7. Copy the Firebase configuration object

### 4. Get Firebase Configuration

The configuration will look like this:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 5. Update Environment Variables

Update your `docker-compose.yml` file with your Firebase configuration:

```yaml
frontend:
  environment:
    - REACT_APP_FIREBASE_API_KEY=your-api-key
    - REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    - REACT_APP_FIREBASE_PROJECT_ID=your-project-id
    - REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
    - REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
    - REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 6. Install Dependencies

```bash
cd frontend
npm install firebase
```

### 7. Deploy

```bash
docker-compose up -d
```

## 🔧 Advanced Configuration

### Firestore Database Setup

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### Security Rules

Update Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Parents can access their own data
    match /parents/{parentId} {
      allow read, write: if request.auth != null && request.auth.uid == parentId;
    }
    
    // Children data - parents can access their children's data
    match /children/{childId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/parents/$(request.auth.uid)/children/$(childId));
    }
    
    // Chat messages - users can access their own messages
    match /chat_messages/{messageId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
  }
}
```

### Email Templates

1. In Authentication > Templates
2. Customize email templates for:
   - Email verification
   - Password reset
   - Email change

### Domain Verification

For production, verify your domain:
1. Go to Authentication > Settings
2. Add your domain to "Authorized domains"
3. Follow verification steps

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit Firebase config to version control
- Use environment variables in production
- Rotate API keys regularly

### 2. Authentication Rules
- Implement proper Firestore security rules
- Use Firebase Auth custom claims for role-based access
- Enable email verification

### 3. Rate Limiting
- Configure Firebase Auth rate limiting
- Monitor authentication attempts
- Set up alerts for suspicious activity

## 🚨 Troubleshooting

### Common Issues

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Ensure Firebase is only initialized once
   - Check for duplicate imports

2. **"Permission denied" errors**
   - Verify Firestore security rules
   - Check user authentication status
   - Ensure proper user document creation

3. **"Invalid API key"**
   - Verify environment variables are set correctly
   - Check Firebase project configuration
   - Ensure API key restrictions are appropriate

4. **"User not found"**
   - Check if user document exists in Firestore
   - Verify user creation process
   - Check authentication state

### Debug Mode

Enable Firebase debug mode:
```javascript
// In your Firebase config
const app = initializeApp(firebaseConfig);
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## 📱 Testing

### Test Users

Create test users in Firebase Console:
1. Go to Authentication > Users
2. Click "Add user"
3. Enter email and password
4. Use these credentials for testing

### Local Testing

For local development, you can use Firebase Auth Emulator:
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

## 🔄 Migration from Keycloak

### Data Migration

If migrating from Keycloak:
1. Export user data from Keycloak
2. Create corresponding Firestore documents
3. Update user IDs in your database
4. Test authentication flow

### Backend Updates

Update your backend to handle Firebase tokens:
1. Verify Firebase ID tokens
2. Extract user information from tokens
3. Update user lookup logic

## 📚 Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

## 🎯 Next Steps

After setup:
1. Test signup and signin flows
2. Verify user data storage in Firestore
3. Test password reset functionality
4. Configure email templates
5. Set up monitoring and alerts
6. Deploy to production 