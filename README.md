<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1g3BLs24zKWyhFlFxUVmVMMv_SgRjW0wf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Project Setup & Configuration

### Operations Log
- **package.json**: Configured with project metadata (description, author, license).
- **.gitignore**: Updated to exclude environment files (`.env*`), coverage reports, and system files.
- **Dependencies**: Installed via `npm install`.
- **Verification**: Verified project startup with `npm run dev`.
