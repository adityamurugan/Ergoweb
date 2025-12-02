ErgoWeb RULA
============

Next.js frontend + FastAPI backend to run MediaPipe Pose on uploaded image/video and compute a simplified RULA score.

Dev
---

- Frontend: Next.js on port 3000
- Backend: FastAPI on port 8000

Environment
-----------

- Copy `.env.example` to `.env.local` and adjust as needed.

Commands
--------

Frontend:

```bash
npm install
npm run dev
```

Backend (Windows PowerShell):

```powershell
cd backend
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Usage
-----

Open `http://localhost:3000` and upload an image or video. The frontend calls the backend `/analyze` endpoint and displays the RULA score and details.



