# Cellar Rat - LIFF V2

Your sophisticated digital sommelier and cellar management system.

**Live Deployment:** [cellar-krmo33cf2-r3cbls-projects.vercel.app](https://cellar-krmo33cf2-r3cbls-projects.vercel.app)
**Repository:** [github.com/rickbushnell-stack/Cellar-Rat-LIFF-V2](https://github.com/rickbushnell-stack/Cellar-Rat-LIFF-V2)

## 1. Firebase Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a Project named "Cellar Rat".
3. Initialize **Firestore Database** in Production Mode.
4. Use these rules (allow public access initially for testing):
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
5. Register a Web App in Firebase Settings to get your config object.

## 2. Vercel Configuration
In your Vercel project (`prj_935TX5LLO10q7eFuYSB6Pu61dmbO`), add these Environment Variables:
- `API_KEY`: Your Gemini API Key
- `FIREBASE_API_KEY`: (from your Firebase config)
- `FIREBASE_AUTH_DOMAIN`: (from your Firebase config)
- `FIREBASE_PROJECT_ID`: (from your Firebase config)
- `FIREBASE_STORAGE_BUCKET`: (from your Firebase config)
- `FIREBASE_MESSAGING_SENDER_ID`: (from your Firebase config)
- `FIREBASE_APP_ID`: (from your Firebase config)

## 3. Deployment
Every time you push to the `main` branch of your GitHub repo, Vercel will automatically update the live site.
```bash
git add .
git commit -m "Update Firebase and branding"
git push origin main
```