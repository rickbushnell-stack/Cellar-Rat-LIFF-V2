# Cellar Rat - Digital Sommelier (LIFF V2)

*Status: Verified Production Configuration*
*Updated: Feb 21, 2025 - 15:00 UTC*

## ✅ Success Checklist
- [x] **Endpoint URL**: `https://cellar-rat.vercel.app` (Verified correct in LINE Console)
- [x] **LIFF ID**: `2008992355-xfKmuxNN` (Now hardcoded as fallback in `App.tsx`)
- [x] **Vercel Routing**: Handled by `vercel.json` to prevent 404s.

## 🧪 Testing instructions
1. Open LINE app on your phone.
2. Go to the LIFF URL: `https://liff.line.me/2008992355-xfKmuxNN`.
3. The app should now ask you to log in (or log you in automatically).
4. **Firebase**: Ensure your Firebase Firestore is in "Test Mode" or has rules allowing read/write for your user ID.

## 🛠 Troubleshooting
- **White Screen?**: Check the browser console. Usually a missing Firebase environment variable.
- **Login Loop?**: Ensure the "Endpoint URL" in LINE Console exactly matches your Vercel URL (including `https://`).