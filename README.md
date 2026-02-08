# Cellar Rat - LIFF V2

Your sophisticated digital sommelier and cellar management system.

## 🚀 Final Integration Checklist for Rick

### Step 1: Firebase Console (Database Setup)
1. Go to the [Firestore Section of cellar-rat](https://console.firebase.google.com/project/cellar-rat/firestore).
2. Click **Create Database**.
3. **Select Edition**: Choose **Standard Edition** and click Next.
4. **Location**: Choose any location (nam5 is fine) and click Next.
5. **Configure Rules**: Select **Start in Test Mode** and click Create.

### Step 2: LINE Developers Console (The LIFF ID)
1. Go to your [LINE Developers Console](https://developers.line.biz/console/).
2. Select your provider and your **LINE Login** channel.
3. Click the **LIFF** tab at the top.
4. Click **Add** to create your app if you haven't yet.
5. **CRITICAL**: Copy the **LIFF ID**. It should look like `2008992355-abc123xy`.
   * *Note: Do NOT copy the Channel ID or Secret by mistake. Only the ID from the LIFF tab works.*

### Step 3: Vercel Environment Variables
Add these to your project settings in Vercel. **Everything is ready for you to copy-paste now:**

| Variable Name | Value |
| :--- | :--- |
| `API_KEY` | `AIzaSyDH6B7AmS2Hpw6flSiUvNLAXd6GGeUQHas` |
| `LIFF_ID` | (The specific ID you got in Step 2) |
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