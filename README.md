Landify — Real-estate front-end demo

Files:

- index.html — main HTML page
- style.css — styles
- script.js — frontend logic (loads `data.json` and renders UI)
- data.json — dummy plots and ventures data

How to run:

1. Open `index.html` in a browser (double-click or serve via a simple static server).
2. Use the Search section to filter by location, area (sq yards), price, or venture.

Notes:

- This is a frontend-only demo using dummy JSON data.
- The "Buy / Contact" button opens a contact modal; sending is a demo alert.

Want enhancements? I can add React, server mocks, or a small backend API next.

Backend (Node.js + Express)

- Install dependencies:

```bash
npm install
```

- Run dev server (requires `nodemon`, included in devDependencies):

```bash
npm run dev
```

- Available API endpoints (base `http://localhost:4000/api`):
  - `GET /plots` — list/search plots (query params: `location`, `venture`, `minArea`, `maxArea`, `minPrice`, `maxPrice`)
  - `POST /plots` — add new plot (JSON body)
  - `GET /ventures` — list ventures
  - `GET /ventures/:name` — venture details and related plots

The backend uses `data.json` as a simple mock database and persists new plots by writing to that file.
