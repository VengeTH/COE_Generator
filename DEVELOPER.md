# Developer & Technical Reference

This document covers everything needed to set up, run, and maintain the COE Generator system.

> For the end-user guide, see [README.md](README.md).

---

## Tech Stack

| Layer    | Technology                                                          |
|----------|---------------------------------------------------------------------|
| Backend  | Node.js, Express, docxtemplater, pizzip, number-to-words, date-fns |
| Frontend | React 18, Tailwind CSS 3, Create React App                         |

---

## Folder Structure

```
COE Generator/
├── .gitignore
├── README.md                    ← End-user guide
├── DEVELOPER.md                 ← This file
├── backend/
│   ├── package.json
│   ├── server.js                ← Express API
│   └── template.docx            ← ⚠️  Required — Word template
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        ├── App.js
        └── components/
            └── COEForm.js
```

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (bundled with Node.js)

### Backend

```bash
cd backend
npm install
npm run dev      # development — auto-restarts on file change (nodemon)
# or
npm start        # production
```

Runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000`.  
The `"proxy": "http://localhost:5000"` entry in `frontend/package.json` forwards all `/api/*` requests to the backend automatically — no CORS config needed in development.

### Production build

```bash
cd frontend
npm run build    # outputs to frontend/build/
```

You can then serve the `build/` folder via any static file host or have Express serve it directly.

---

## Template Setup (`template.docx`)

Place your Word document template at `backend/template.docx`.

The file must contain these **exact** placeholder tags (curly braces, no spaces):

| Tag                 | Replaced with                                              |
|---------------------|------------------------------------------------------------|
| `{employee_name}`   | Employee's full name                                       |
| `{position}`        | Position/designation                                       |
| `{office_name}`     | Office or department name                                  |
| `{salary_in_words}` | e.g. *Twenty-Five Thousand Pesos*                          |
| `{salary_numeric}`  | e.g. *Php 25,000.00*                                       |
| `{date_generated}`  | e.g. *19th day of February 2026*                           |

> Tags use single curly braces `{ }` — docxtemplater's default delimiters.  
> Do **not** use `{{ }}`, `[[ ]]`, or `< >`.

---

## API Reference

### `POST /api/generate-coe`

Accepts a JSON body and returns a generated `.docx` file as a binary download.

**Request headers:**
```
Content-Type: application/json
```

**Request body:**
```json
{
  "name": "Juan Dela Cruz",
  "position": "Administrative Assistant II",
  "office_name": "HRMO",
  "salary_numeric": 25000
}
```

| Field            | Type   | Required | Description                        |
|------------------|--------|----------|------------------------------------|
| `name`           | string | Yes      | Employee's full name               |
| `position`       | string | Yes      | Position or designation            |
| `office_name`    | string | Yes      | Office or department               |
| `salary_numeric` | number | Yes      | Monthly salary (non-negative)      |

**Success response:**  
`200 OK` — binary `.docx` file stream with headers:
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="COE_Juan_Dela_Cruz.docx"
```

**Error response:**
```json
{ "error": "Human-readable description of the problem." }
```

---

### `GET /api/health`

Quick liveness check.

**Response:**
```json
{ "status": "ok", "timestamp": "2026-02-19T08:00:00.000Z" }
```

---

## Key Implementation Notes

### Ordinal date formatting (`server.js`)

`getOrdinalSuffix(day)` handles the edge cases: 11th, 12th, 13th always use "th" regardless of their last digit.

### Salary in words

`number-to-words` (`toWords()`) returns lowercase output. The server title-cases each word and appends "Pesos".

### File download (frontend)

The response blob is converted to an object URL, a temporary `<a>` element is clicked programmatically, then the URL is immediately revoked — no server-side file storage required.

---

## Environment Variables

The backend reads `process.env.PORT` (defaults to `5000`).  
Create a `backend/.env` file to override:

```
PORT=5000
```

> `backend/.env` is listed in `.gitignore` and will not be committed.

---

## Adding More Office Options

Edit the `OFFICE_OPTIONS` array in [frontend/src/components/COEForm.js](frontend/src/components/COEForm.js):

```js
const OFFICE_OPTIONS = [
  "Mayor's Office",
  "HRMO",
  "MSWDO",
  // add entries here
];
```

No backend changes are needed.
