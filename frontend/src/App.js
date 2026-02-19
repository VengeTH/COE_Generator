import React from "react";
import COEForm from "./components/COEForm";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg mb-4">
          {/* Document icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          COE Generator
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Certificate of Employment — fill in the details below to generate a
          document.
        </p>
      </div>

      {/* Form card */}
      <COEForm />

      {/* Footer */}
      <p className="mt-8 text-xs text-slate-400">
        Municipality HR &mdash; Internal Tool
      </p>
    </div>
  );
}
