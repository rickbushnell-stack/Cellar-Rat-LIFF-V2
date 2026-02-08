# Cellar Rat - LIFF V2

Your sophisticated digital sommelier and cellar management system.

## 🚀 Final Integration Checklist for Rick

### Step 1: Firebase Console (Database Setup)
1. Go to the [Firestore Section of cellar-rat](https://console.firebase.google.com/project/cellar-rat/firestore).
2. Click **Create Database**.
3. **Select Edition**: Choose **Standard Edition** and click Next.
4. **Location**: Choose any location (nam5 is fine) and click Next.
5. **Configure Rules**: Select **Start in Test Mode** and click Create.

### Step 2: LINE Developers Console (Access)
1. In your LINE console, click the **LIFF** tab (next to Basic Settings).
2. Click **Add** to create a new LIFF app.
3. **Endpoint URL**: `https://cellar-krmo33cf2-r3cbls-projects.vercel.app`
4. **Scopes**: Check `openid` and `profile`.
5. Once saved, copy the **LIFF ID** (it looks like `2008992355-abc123xy`).

### Step 3: Vercel Environment Variables
Add these to your project settings in Vercel:

| Variable Name | Value |
| :--- | :--- |
| `API_KEY` | (Your Google Gemini Key) |
| `LIFF_ID` | (The ID you got from the LIFF tab) |
| `FIREBASE_API_KEY` | `AIzaSyAlSzIfTFQTNrrv9AHwRM6F1Ilc_WiIoRQ` |
| `FIREBASE_AUTH_DOMAIN` | `cellar-rat.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `cellar-rat` |
| `FIREBASE_STORAGE_BUCKET` | `cellar-rat.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `724887154017` |
| `FIREBASE_APP_ID` | `1:724887154017:web:e30204651b954d3eea6920` |

---

## 🍇 How to use
1. Open the URL on your phone or in LINE.
2. Log in with your LINE account.
3. Your wine collection is now synced to your private cloud profile!