"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { toWords } = require("number-to-words");
const { format } = require("date-fns");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the ordinal suffix for a given day number.
 * Handles the 11th/12th/13th exceptions correctly.
 * @param {number} day
 * @returns {string} e.g. "st", "nd", "rd", "th"
 */
function getOrdinalSuffix(day) {
  const mod100 = day % 100;
  // 11, 12, 13 are always "th"
  if (mod100 >= 11 && mod100 <= 13) return "th";
  const mod10 = day % 10;
  if (mod10 === 1) return "st";
  if (mod10 === 2) return "nd";
  if (mod10 === 3) return "rd";
  return "th";
}

/**
 * Formats a Date into "3rd day of February 2026" style.
 * @param {Date} date
 * @returns {string}
 */
function formatDateLong(date) {
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const monthName = format(date, "MMMM"); // e.g. "February"
  const year = date.getFullYear();
  return `${day}${suffix} day of ${monthName} ${year}`;
}

/**
 * Converts a numeric salary into title-case words with "Pesos" appended.
 * e.g. 1050540 → "One Million Fifty Thousand Five Hundred Forty Pesos"
 * @param {number} amount
 * @returns {string}
 */
function salaryToWords(amount) {
  // toWords() returns lower-case words like "one million fifty thousand..."
  const words = toWords(Math.floor(amount)); // ignore cents for words
  // Title-case each word
  const titleCased = words
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return `${titleCased} Pesos`;
}

/**
 * Formats a number as "Php 1,050,540.00".
 * @param {number} amount
 * @returns {string}
 */
function formatSalaryNumeric(amount) {
  const formatted = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Php ${formatted}`;
}

/**
 * Parses a "YYYY-MM-DD" date string into "Month D, YYYY" (e.g. "August 1, 1989").
 * Uses a local-time Date constructor to avoid UTC-offset day shifts.
 * @param {string} dateStr  — "YYYY-MM-DD"
 * @returns {string}
 */
function formatEmploymentDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day); // local time — no UTC shift
  return format(d, "MMMM d, yyyy");
}

// ─── Route ────────────────────────────────────────────────────────────────────

app.post("/api/generate-coe", (req, res) => {
  try {
    const {
      name,
      position,
      office_name,
      salary_numeric,
      start_date_raw,
      end_date_raw,
      is_currently_employed,
    } = req.body;

    // ── Validate required fields ──────────────────────────────────────────────
    const missing = [];
    if (!name || String(name).trim() === "") missing.push("name");
    if (!position || String(position).trim() === "") missing.push("position");
    if (!office_name || String(office_name).trim() === "")
      missing.push("office_name");
    if (salary_numeric === undefined || salary_numeric === null || salary_numeric === "")
      missing.push("salary_numeric");
    if (!start_date_raw) missing.push("start_date_raw");
    if (!is_currently_employed && !end_date_raw) missing.push("end_date_raw");

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required field(s): ${missing.join(", ")}`,
      });
    }

    const salaryAmount = parseFloat(salary_numeric);
    if (isNaN(salaryAmount) || salaryAmount < 0) {
      return res
        .status(400)
        .json({ error: "salary_numeric must be a valid non-negative number." });
    }

    // Validate date format (must be YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(start_date_raw)) {
      return res.status(400).json({ error: "start_date_raw must be in YYYY-MM-DD format." });
    }
    if (!is_currently_employed && !datePattern.test(end_date_raw)) {
      return res.status(400).json({ error: "end_date_raw must be in YYYY-MM-DD format." });
    }

    // ── Build template variables ──────────────────────────────────────────────
    const today = new Date();
    const dateGenerated = formatDateLong(today);
    const salaryInWords = salaryToWords(salaryAmount);
    const salaryFormatted = formatSalaryNumeric(salaryAmount);

    const startDate = formatEmploymentDate(start_date_raw);
    const endDate = is_currently_employed
      ? "present"
      : formatEmploymentDate(end_date_raw);

    // ── Load template ─────────────────────────────────────────────────────────
    const templatePath = path.join(__dirname, "template.docx");

    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({
        error:
          "template.docx not found in the backend directory. Please add your COE template file.",
      });
    }

    const templateBuffer = fs.readFileSync(templatePath);
    const zip = new PizZip(templateBuffer);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // Throw on undefined tags so bugs surface early
      errorLogging: false,
    });

    // ── Inject data ───────────────────────────────────────────────────────────
    doc.render({
      employee_name: String(name).trim(),
      position: String(position).trim(),
      office_name: String(office_name).trim(),
      salary_in_words: salaryInWords,
      salary_numeric: salaryFormatted,
      date_generated: dateGenerated,
      start_date: startDate,
      end_date: endDate,
    });

    // ── Generate output buffer ────────────────────────────────────────────────
    const outputBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // ── Send as downloadable file ─────────────────────────────────────────────
    const safeName = String(name)
      .trim()
      .replace(/[^a-zA-Z0-9\s_-]/g, "")
      .replace(/\s+/g, "_");

    const filename = `COE_${safeName}.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Content-Length", outputBuffer.length);

    return res.end(outputBuffer);
  } catch (err) {
    console.error("[/api/generate-coe] Error:", err);

    // Docxtemplater template error (e.g. malformed tag)
    if (err.properties && err.properties.errors) {
      const templateErrors = err.properties.errors
        .map((e) => e.message)
        .join("; ");
      return res.status(500).json({
        error: `Template error: ${templateErrors}`,
      });
    }

    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`COE Generator backend running on http://localhost:${PORT}`);
  console.log(`POST http://localhost:${PORT}/api/generate-coe`);
});
