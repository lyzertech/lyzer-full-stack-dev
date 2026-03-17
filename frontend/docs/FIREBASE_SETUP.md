# Firebase Setup Guide

## 🔥 Getting Your Firebase Credentials

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard

### Step 2: Get Your Firebase Config

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you don't have a web app yet:
   - Click **"</>"** (Web icon) to add a web app
   - Register your app (you can skip Firebase Hosting for now)
5. Copy the **Firebase SDK snippet** → **Config** object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### Step 3: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - ✅ **Email/Password** (click "Enable")
   - ✅ **Google** (click "Enable" → Configure → Save)
   - ✅ **Facebook** (click "Enable" → Configure with App ID and App Secret → Save)

### Step 4: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Important**: Restart your Next.js development server after adding environment variables:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

## 🔐 OAuth Setup (Optional but Recommended)

### Google OAuth Setup

1. In Firebase Console → Authentication → Sign-in method → Google
2. Click **"Enable"**
3. Enter your **Project support email**
4. Click **"Save"**
5. Firebase will automatically configure the OAuth consent screen

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add **Facebook Login** product
4. Get your **App ID** and **App Secret**
5. In Firebase Console → Authentication → Sign-in method → Facebook
6. Click **"Enable"**
7. Enter your **App ID** and **App Secret**
8. Copy the **OAuth redirect URI** from Firebase
9. In Facebook App Settings → Facebook Login → Settings, add the redirect URI
10. Click **"Save"** in Firebase

## ✅ Verification

After setting up:

1. **Check your `.env.local` file** exists and has all required values
2. **Restart your dev server** (`npm run dev`)
3. **Try signing up** at `/authentication/sign-up`
4. **Check browser console** - you should NOT see Firebase API key errors

## 🚨 Troubleshooting

### Error: "auth/api-key-not-valid"
- ✅ Make sure `.env.local` exists (not just `.env.local.example`)
- ✅ Verify all environment variables start with `NEXT_PUBLIC_`
- ✅ Restart your Next.js dev server after adding env variables
- ✅ Check that values don't have extra quotes or spaces

### Error: "auth/unauthorized-domain"
- ✅ In Firebase Console → Authentication → Settings → Authorized domains
- ✅ Add `localhost` (should be there by default)
- ✅ Add your production domain when deploying

### OAuth Not Working
- ✅ Verify OAuth providers are enabled in Firebase Console
- ✅ Check authorized domains include your domain
- ✅ For Facebook: Verify redirect URI is configured correctly

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Console](https://console.firebase.google.com/)

