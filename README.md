# Cellar Rat - Digital Sommelier (LIFF V2)

*Status: Verified Production Configuration*
*Updated: Feb 21, 2025 - 15:30 UTC*

## 🍷 Step-by-Step: Fixing the "Analyzing" Hang
If your app gets stuck on "Analyzing..." or the Sommelier doesn't reply, follow these steps:

1. **Get a Gemini API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/).
   - Click **"Get API Key"** on the left.
   - Click **"Create API key in new project"**.
   - Copy that long string of letters and numbers.

2. **Add to Vercel**:
   - Open your [Vercel Dashboard](https://vercel.com/dashboard).
   - Click on your **cellar-rat** project.
   - Go to **Settings** (top tab) -> **Environment Variables** (left menu).
   - **Key**: `API_KEY`
   - **Value**: (Paste your key here)
   - Click **Save**.

3. **Redeploy**:
   - Go to the **Deployments** tab in Vercel.
   - Find your latest deployment, click the three dots (`...`), and select **Redeploy**.
   - Once it finishes, refresh your LINE app!

## ✅ Success Checklist
- [x] **Endpoint URL**: `https://cellar-rat.vercel.app`
- [x] **LIFF ID**: `2008992355-xfKmuxNN`
- [x] **Vercel Routing**: Handled by `vercel.json`.
- [x] **Import Map**: Cleaned of version conflicts.

## 🛠 Troubleshooting
- **White Screen?**: Usually means a duplicate import in `index.html` or a trailing slash in your `importmap`.
- **Login Loop?**: Check that your LINE Developer Console "Endpoint URL" matches Vercel exactly.