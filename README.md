
# VintnerAI Setup Guide

Follow these steps to deploy your Digital Sommelier to Vercel with a Firebase backend.

## 1. Firebase Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Project (e.g., "VintnerAI").
3. In the sidebar, click **Firestore Database** and create a database in **Production Mode**.
4. Set your security rules to allow read/write (initially for testing, later add Auth):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
5. Go to Project Settings (gear icon) -> General -> Your Apps.
6. Click the `</>` (Web) icon to register a web app.
7. Copy the `firebaseConfig` values.

## 2. GitHub Connection
1. Initialize git in your local folder:
   ```bash
   git init
   git add .
   git commit -m "Initial VintnerAI cloud setup"
   ```
2. Create a new repository on GitHub.
3. Link and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## 3. Vercel Deployment
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. **CRITICAL**: Before clicking Deploy, expand **Environment Variables**.
5. Add the following keys from your Gemini and Firebase setups:
   - `API_KEY` (Your Google AI API Key)
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
6. Click **Deploy**.

Your app is now live and synced to the cloud!
