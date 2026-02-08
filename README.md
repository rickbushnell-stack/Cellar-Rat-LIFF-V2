# Cellar Rat - Digital Sommelier (LIFF V2)

*Current Build Status: Verified Root Deployment*
*Sync Timestamp: Feb 21, 2025 - 14:15 UTC*

## 🧪 Testing Your App
1. **Admin Access**: Open `https://liff.line.me/2008992355-xfKmuxNN` in your LINE app.
2. **Developing Status**: You do NOT need to publish to test. As the admin, it works for you automatically.
3. **Adding Testers**: Go to LINE Developers Console > Roles > Add Tester to let friends try it.

## 🛠 Troubleshooting "Files Not Showing"
If your `index.html` or `index.tsx` are missing from the Git Sync:
1. **Folder Check**: Ensure files are in the **ROOT** folder (e.g., `cellar-rat/index.html`), not inside `cellar-rat/src/`.
2. **File Extensions**: Ensure they are exactly `.html`, `.tsx`, and `.ts`.
3. **Save All**: Ensure you have clicked "Save" on every file before hitting "Sync Git".

## 🚀 Environment Variables
Required in Vercel:
- `API_KEY`: Gemini API Key
- `LIFF_ID`: `2008992355-xfKmuxNN`
- `FIREBASE_API_KEY`: Your Firebase Key
- `FIREBASE_PROJECT_ID`: `cellar-rat`