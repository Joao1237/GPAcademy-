Deploy notes for GPAcademy

Overview
- This repo has two Node.js services:
  - backend (Express API) in `backend/`
  - frontend (static server that emits `js/config.js`) in `frontend/`

Local run
- Backend (from repo root):

```bash
cd backend
npm install
npm start
```

- Frontend (from repo root):

```bash
cd frontend
npm install
npm start
```

Notes: both apps load environment variables from their own `.env` files located in `backend/.env` and `frontend/.env` respectively.

Render (recommended)
- `render.yaml` is provided. It declares two web services (`gpacademy-api` and `gpacademy-web`).
- Add environment variables in Render dashboard or use `MYSQL_PUBLIC_URL` for managed DBs.
- Build/start commands are already set in `render.yaml`.
- Health check for backend: `/health`.

Vercel (frontend)
- `vercel.json` contains a rewrite that must be updated with the deployed backend URL. Replace `SUBSTITUA-PELA-URL-DO-BACKEND.onrender.com` with your backend URL.
- Alternatively, host frontend on Render (node service) as configured in `render.yaml`.

Environment variables
- Recommended: set `MYSQL_PUBLIC_URL` with a full mysql://user:pass@host:port/db string in the Render service env vars OR set the `DB_*` variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- Set `FRONTEND_URL` in backend Render env to your frontend public URL.

CI / Production
- Ensure `NODE_ENV=production` is set for both services.
- For database migrations or seed, run scripts manually (not included).

Troubleshooting
- If the server ignores `.env`, both services now load `.env` from their own folders explicitly.
- If you get `Access denied` from MySQL, verify credentials and whether the DB accepts external connections (host, user permissions).

Contact
- If you want, I can add a simple health-check script, a Procfile, or automate environment sync between Render and Vercel.
