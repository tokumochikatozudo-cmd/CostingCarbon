# CostingCarbon – API Key Setup

The Gemini API key is **never stored in source code**.
When a user opens the app and clicks to chat with Gaia for the first time,
the browser will prompt them to enter the key once per session.

## For developers / self-hosting

1. Open the live app in your browser.
2. Navigate to any panel → open **Insights & Forecast** → chat with Gaia.
3. When prompted, paste your **Gemini API key** (starts with `AIza...`).
4. The key is kept in `sessionStorage` — cleared automatically when the tab closes.

## Getting a Gemini API key

1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API key**
3. Copy the key and paste it into the app prompt.

> ⚠️ **Never commit API keys to Git.** The `.gitignore` excludes all `config.js` and `.env` files.
