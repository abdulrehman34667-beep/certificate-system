# Certificate System (Admin + Auto GitHub Upload)

## What this repo contains
- `index.html` — Public certificate search + PDF download
- `admin.html` — Admin login + Add student form (uploads image & updates `data.json` via GitHub)
- `data.json` — Student database (auto-updated)
- `/images` — Folder for uploaded images (committed to GitHub automatically by the API)
- `/api/add-student.js` — Serverless function for Vercel that uploads image and updates `data.json` using GitHub API
- `style.css` — Shared styles
- `package.json` — dependencies for serverless function (axios)

## How it works
1. Admin logs in on `admin.html` (username & password stored in Vercel env variables).
2. Admin fills form and uploads a picture.
3. Admin panel sends a POST request to `/api/add-student` with student data and image (base64).
4. Serverless function uploads the image to `images/` and updates `data.json` in your GitHub repo using GitHub REST API.
5. Vercel auto-deploys the updated site and `index.html` can read `data.json` to show certificates.

## IMPORTANT: Environment Variables (Set these in Vercel dashboard)
- `GITHUB_TOKEN` — Your GitHub Personal Access Token with `repo` (contents) permission.
- `GITHUB_USERNAME` — e.g. `abdulrehman34667-beep`
- `GITHUB_REPO` — e.g. `certificate-system`
- `ADMIN_USER` — Admin username (e.g. Rehman@11)
- `ADMIN_PASS` — Admin password (e.g. Rehman@3123)

## Deploy on Vercel
1. Push this repo to GitHub.
2. On Vercel, import the GitHub repo.
3. In Project Settings → Environment Variables, add the variables above.
4. Deploy. The `/api` functions will run as serverless functions.

## Notes & Limits
- GitHub content API has file size limits (~100 MB per file, but better keep images small).
- The admin uploads images as base64; ensure images aren't extremely large.
- Keep your `GITHUB_TOKEN` secret. Do NOT paste it in public chat.

## Troubleshooting
- If `admin.html` reports "Admin credentials not configured", ensure `ADMIN_USER` and `ADMIN_PASS` are set.
- If uploads fail, check the Vercel function logs for errors (Vercel Dashboard → Functions → Logs).
