# X-Brain — Setup & Run Guide

## Prerequisites
- Python 3.10+ 
- Node.js 18+
- Git (already cloned the xbrain backend)

---

## 1. Backend Setup

```bash
# Navigate to your cloned xbrain folder
cd xbrain

# Create virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate        # Mac/Linux
# .venv\Scripts\activate         # Windows

# Install all dependencies
pip install -r requirements.txt

# Create .env file with your API key
cp .env.example .env             # or create manually:
echo "GROQ_API_KEY=your_key_here" > .env

# Place model weights in checkpoints/
# checkpoints/EfficientNetB0_BrainTumor_full.weights.h5
# checkpoints/SwinUNETR_Segmentation_best.pth

# Start the backend
uvicorn api.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at:     http://localhost:8000/docs

---

## 2. Frontend Setup

```bash
# In a NEW terminal, navigate to this folder
cd xbrain-frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 3. Get a free Groq API key
1. Go to https://console.groq.com
2. Sign up (free)
3. Create an API key
4. Add it to your .env: GROQ_API_KEY=gsk_...

---

## Quick Start (once set up)

Terminal 1 — Backend:
```bash
cd xbrain && source .venv/bin/activate && uvicorn api.main:app --reload --port 8000
```

Terminal 2 — Frontend:
```bash
cd xbrain-frontend && npm run dev
```

Then open: http://localhost:5173
