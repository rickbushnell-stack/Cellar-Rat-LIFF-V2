# Cellar Rat - LIFF V2

Your sophisticated digital sommelier and cellar management system.

## 🧪 How to Test Before Publishing
Don't worry about the "Developing" status! You can test everything right now:

1. **Self-Testing**: Since you are the Admin, the URL `https://liff.line.me/2008992355-xfKmuxNN` will work for you immediately. Open it in your LINE app or mobile browser.
2. **Adding Friends**: To let others test:
   - Go to the **LINE Developers Console**.
   - Select your provider/channel.
   - Click the **Roles** tab.
   - Click **Add** and search for your friend's LINE display name or ID to add them as a "Tester."
3. **Status**: Keep the app in "Developing" until you are 100% happy with it. "Published" is only for when you want to launch it to the public.

## 🚀 Final Integration Checklist

### Step 1: Firebase Console (Database Setup)
1. Go to the [Firestore Section of cellar-rat](https://console.firebase.google.com/project/cellar-rat/firestore).
2. Click **Create Database** (Start in **Test Mode**).

### Step 2: Vercel Environment Variables
Add these to your project settings in Vercel:

| Variable Name | Value |
| :--- | :--- |
| `API_KEY` | `AIzaSyDH6B7AmS2Hpw6flSiUvNLAXd6GGeUQHas` |
| `LIFF_ID` | `2008992355-xfKmuxNN` |
| `FIREBASE_API_KEY` | `AIzaSyAlSzIfTFQTNrrv9AHwRM6F1Ilc_WiIoRQ` |
| `FIREBASE_AUTH_DOMAIN` | `cellar-rat.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `cellar-rat` |
| `FIREBASE_STORAGE_BUCKET` | `cellar-rat.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `724887154017` |
| `FIREBASE_APP_ID` | `1:724887154017:web:e30204651b954d3eea6920` |

---

## 🍇 Usage
1. Open the URL on your phone.
2. Log in with LINE.
3. Use the "Scan Label" button to let the AI catalog your wine automatically.