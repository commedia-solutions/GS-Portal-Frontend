/**
 * Utilities for formatting Active Pass details (Date, AOS/LOS time, and Duration)
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Deterministically formats the pass date in UTC as "DD MMM YYYY" (e.g. "18 Sep 2026").
 * Source of truth is the pass schedule (AOS or schedule date).
 */
export function formatPassDate(dateOrAos?: string | null): string {
  if (!dateOrAos || dateOrAos === "--" || dateOrAos === "null" || dateOrAos === "undefined") {
    return "--";
  }

  const trimmed = String(dateOrAos).trim();
  if (!trimmed || trimmed === "--") return "--";

  // If already formatted like "18 Sep 2026"
  if (/^\d{1,2}\s+[A-Za-z]{3,4}\s+\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/\s+/);
    const day = parts[0].padStart(2, "0");
    const mStr = parts[1].substring(0, 3);
    const year = parts[2];
    return `${day} ${mStr.charAt(0).toUpperCase() + mStr.slice(1).toLowerCase()} ${year}`;
  }

  // 1. Try Date constructor
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = MONTHS[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    return `${day} ${month} ${year}`;
  }

  // 2. Try regex for "YYYY-MM-DD" or "YYYY MM DD" or "YYYY/MM/DD"
  const isoMatch = trimmed.match(/(\d{4})[-\/\s](\d{1,2})[-\/\s](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const monthIndex = parseInt(isoMatch[2], 10) - 1;
    const day = String(parseInt(isoMatch[3], 10)).padStart(2, "0");
    const month = MONTHS[monthIndex];
    if (month) {
      return `${day} ${month} ${year}`;
    }
  }

  // 3. Try regex for "DD-MM-YYYY" or "DD/MM/YYYY"
  const dmyMatch = trimmed.match(/(\d{1,2})[-\/\s](\d{1,2})[-\/\s](\d{4})/);
  if (dmyMatch) {
    const day = String(parseInt(dmyMatch[1], 10)).padStart(2, "0");
    const monthIndex = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const month = MONTHS[monthIndex];
    if (month) {
      return `${day} ${month} ${year}`;
    }
  }

  return "--";
}

/**
 * Deterministically formats the time in UTC as "HH:mm UTC".
 */
export function formatPassTime(timeStr?: string | null): string {
  if (!timeStr || timeStr === "--" || timeStr === "null" || timeStr === "undefined") {
    return "--";
  }

  const trimmed = String(timeStr).trim();
  if (!trimmed || trimmed === "--") return "--";

  // Try parsing ISO/Timestamp with Date
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const hh = d.getUTCHours().toString().padStart(2, "0");
    const mm = d.getUTCMinutes().toString().padStart(2, "0");
    return `${hh}:${mm} UTC`;
  }

  if (trimmed.includes("UTC")) return trimmed;

  // Match HH:mm:ss or HH:mm
  const timeMatch = trimmed.match(/\b(\d{2}):(\d{2})(?::(\d{2}))?\b/);
  if (timeMatch) {
    return `${timeMatch[1]}:${timeMatch[2]} UTC`;
  }

  return trimmed;
}

/**
 * Helper to parse a time string or timestamp into milliseconds.
 */
function parseTimeToMs(timeStr?: string | null): number | null {
  if (!timeStr || timeStr === "--" || timeStr === "null" || timeStr === "undefined") {
    return null;
  }

  const trimmed = String(timeStr).trim();

  // 1. Try Date parser if contains date or ISO format
  if (trimmed.includes("T") || trimmed.includes("-") || trimmed.includes("/")) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.getTime();
    }
  }

  // 2. Try parsing HH:mm:ss or HH:mm
  const match = trimmed.match(/(?:T|\b)(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  // 3. Fallback Date constructor
  const fallbackDate = new Date(trimmed);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate.getTime();
  }

  return null;
}

/**
 * Calculates pass duration from LOS - AOS.
 * Formats:
 * - "< 1 hour": "15m 00s", "32m 30s", "1m 30s"
 * - ">= 1 hour": "1h 05m 30s", "2h 00m 00s"
 * Returns "--" if AOS or LOS is missing, invalid, or LOS <= AOS.
 */
export function formatPassDuration(aos?: string | null, los?: string | null): string {
  if (!aos || !los || aos === "--" || los === "--" || aos === "null" || los === "null") {
    return "--";
  }

  // Check if both are full Date strings
  const dateAos = new Date(aos).getTime();
  const dateLos = new Date(los).getTime();

  let diffMs: number | null = null;

  if (!isNaN(dateAos) && !isNaN(dateLos) && (aos.includes("T") || aos.includes("-") || aos.includes("/"))) {
    diffMs = dateLos - dateAos;
  } else {
    const msAos = parseTimeToMs(aos);
    const msLos = parseTimeToMs(los);
    if (msAos !== null && msLos !== null) {
      diffMs = msLos - msAos;
      // Handle day wraparound if LOS is slightly past midnight
      if (diffMs < 0) {
        diffMs += 24 * 3600 * 1000;
      }
    }
  }

  if (diffMs === null || isNaN(diffMs) || diffMs <= 0) {
    return "--";
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mStr = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const sStr = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}h ${mStr}m ${sStr}s`;
  }

  return `${mStr}m ${sStr}s`;
}
