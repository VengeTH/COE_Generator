import React, { useState } from "react";

// ─── Office options ────────────────────────────────────────────────────────────
const OFFICE_OPTIONS = [
  "Mayor's Office",
  "Vice Mayor's Office",
  "HRMO",
  "MSWDO",
  "Engineering Office",
  "Budget Office",
  "Accounting Office",
  "Assessor's Office",
  "Civil Registrar's Office",
  "Health Office",
  "BPLO",
  "DILG",
  "Tourism Office",
  "Agriculture Office",
  "Environment and Natural Resources Office",
  "Disaster Risk Reduction and Management Office",
  "Legal Office",
  "Information Office",
  "Sangguniang Bayan",
  "Other",
];

// ─── Field component ───────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────────────────────
export default function COEForm() {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    office_name: "",
    salary_numeric: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successName, setSuccessName] = useState("");

  // ── Validation ────────────────────────────────────────────────────────────
  function validate() {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required.";
    if (!formData.position.trim()) errors.position = "Position is required.";
    if (!formData.office_name)
      errors.office_name = "Please select an office/department.";
    if (!formData.salary_numeric && formData.salary_numeric !== 0) {
      errors.salary_numeric = "Salary is required.";
    } else if (
      isNaN(parseFloat(formData.salary_numeric)) ||
      parseFloat(formData.salary_numeric) < 0
    ) {
      errors.salary_numeric = "Please enter a valid non-negative salary.";
    }
    return errors;
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
    setSuccessName("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccessName("");

    // Client-side validation
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-coe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          position: formData.position.trim(),
          office_name: formData.office_name,
          salary_numeric: parseFloat(formData.salary_numeric),
        }),
      });

      if (!response.ok) {
        // Try to parse the JSON error message from the server
        let message = `Server error (${response.status})`;
        try {
          const errBody = await response.json();
          if (errBody.error) message = errBody.error;
        } catch {
          // ignore JSON parse failure
        }
        setServerError(message);
        return;
      }

      // Extract filename from Content-Disposition header if available
      const disposition = response.headers.get("Content-Disposition");
      let filename = `COE_${formData.name.trim().replace(/\s+/g, "_")}.docx`;
      if (disposition) {
        const match = disposition.match(/filename="(.+?)"/);
        if (match && match[1]) filename = match[1];
      }

      // Trigger browser download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setSuccessName(formData.name.trim());
    } catch (err) {
      console.error("Request failed:", err);
      setServerError(
        "Could not connect to the server. Make sure the backend is running on port 5000."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setFormData({ name: "", position: "", office_name: "", salary_numeric: "" });
    setFieldErrors({});
    setServerError("");
    setSuccessName("");
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
        <h2 className="text-base font-semibold text-slate-800">
          Employee Details
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          All fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="px-6 py-6 space-y-5">
        {/* Full Name */}
        <Field label="Full Name" required error={fieldErrors.name}>
          <input
            type="text"
            name="name"
            className="form-input"
            placeholder="e.g. Juan Dela Cruz"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="name"
          />
        </Field>

        {/* Position */}
        <Field label="Position / Designation" required error={fieldErrors.position}>
          <input
            type="text"
            name="position"
            className="form-input"
            placeholder="e.g. Administrative Assistant II"
            value={formData.position}
            onChange={handleChange}
            disabled={isLoading}
          />
        </Field>

        {/* Office / Department */}
        <Field
          label="Office / Department"
          required
          error={fieldErrors.office_name}
        >
          <select
            name="office_name"
            className="form-input"
            value={formData.office_name}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="" disabled>
              — Select an office —
            </option>
            {OFFICE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        {/* Salary */}
        <Field label="Monthly Salary (PHP)" required error={fieldErrors.salary_numeric}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none">
              ₱
            </span>
            <input
              type="number"
              name="salary_numeric"
              className="form-input pl-8"
              placeholder="e.g. 25000"
              min="0"
              step="0.01"
              value={formData.salary_numeric}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </Field>

        {/* Server error banner */}
        {serverError && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        {/* Success banner */}
        {successName && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              <strong>COE_{successName.replace(/\s+/g, "_")}.docx</strong> has
              been generated and downloaded successfully.
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm
                       hover:bg-blue-700 active:bg-blue-800
                       focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition duration-150"
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Generate &amp; Download COE
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm
                       hover:bg-slate-50 active:bg-slate-100
                       focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition duration-150"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
