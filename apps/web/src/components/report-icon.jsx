'use client';

/** Weekly report chart icon; `animated` adds the travelling "ready" dot used on Today. */
export function ReportIcon({ animated = false }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 21v-4m5 4v-7m5 7v-5m5 5V11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M3 13 8 8 12 12 20 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {animated && (
        <circle className="report-ready-dot" cx="20" cy="3" r="1.8" fill="currentColor" />
      )}
    </svg>
  );
}
