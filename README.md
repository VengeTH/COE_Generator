# COE Generator — User Guide

This tool lets you quickly generate a **Certificate of Employment (COE)** document without touching Word. Fill out a short form in your browser and a ready-to-download `.docx` file is created for you instantly.

> For setup and technical information, see [DEVELOPER.md](DEVELOPER.md).

---

## What You Need Before Starting

1. **The application must already be running** — ask your IT officer or developer to start both the backend and frontend servers. Once they are running, they will give you a link that looks like `http://localhost:3000`.
2. A browser (Chrome, Edge, or Firefox recommended).

---

## How to Generate a COE

1. **Open the app** in your browser using the link provided to you (e.g. `http://localhost:3000`).

2. **Fill in the form** — all fields marked with a red asterisk (\*) are required:

   | Field | What to enter |
   |---|---|
   | **Full Name** | The employee's complete name (e.g. *Juan Dela Cruz*) |
   | **Position / Designation** | Their official position title (e.g. *Administrative Assistant II*) |
   | **Office / Department** | Select the correct office from the dropdown list |
   | **Monthly Salary (PHP)** | The employee's monthly salary in numbers only, no commas (e.g. *25000*) |

3. **Click "Generate & Download COE"** — the document will be created automatically and your browser will download it as a `.docx` file named `COE_[Employee Name].docx`.

4. **Open the downloaded file** in Microsoft Word to review, sign, and print.

---

## What the Document Will Contain

The generated COE will automatically fill in:

- The employee's full name, position, and office
- The salary written out in words (e.g. *Twenty-Five Thousand Pesos*) and in number format (e.g. *Php 25,000.00*)
- Today's date formatted as (e.g. *19th day of February 2026*)

---

## Troubleshooting

| Problem | What to do |
|---|---|
| Page won't load / blank screen | Make sure both the backend and frontend servers are running. Contact your IT officer. |
| "Could not connect to the server" error | The backend server is not running. Ask your IT officer to start it. |
| "template.docx not found" error | The Word template file is missing from the backend folder. Contact your IT officer. |
| Downloaded file looks wrong or has `{tags}` visible | The Word template needs to be updated with the correct placeholder tags. Contact your IT officer. |
| I filled all fields but nothing downloads | Check that the salary field contains only numbers (no peso sign or commas). |

---

## Need Help?

Contact your office IT officer or the developer who set up this system.
