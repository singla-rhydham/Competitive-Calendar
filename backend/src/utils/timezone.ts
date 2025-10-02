import { DateTime } from 'luxon';

/**
 * Parse CodeChef IST datetime string into a UTC Date
 * Example input: "08 Oct 2025  20:00:00"
 */
export function parseISTtoUTC(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);

  // Clean up extra spaces just in case
  const cleaned = dateStr.replace(/\s+/g, ' ').trim();

  // Try strict format first (dd LLL yyyy HH:mm:ss)
  let dt = DateTime.fromFormat(cleaned, "dd LLL yyyy HH:mm:ss", {
    zone: "Asia/Kolkata",
    locale: "en",
  });

  // If still invalid, try ISO parse but force IST
  if (!dt.isValid) {
    dt = DateTime.fromISO(cleaned, { zone: "Asia/Kolkata" });
  }

  // If still invalid, fallback to JS Date + IST zone
  if (!dt.isValid) {
    const js = new Date(cleaned);
    dt = DateTime.fromJSDate(js).setZone("Asia/Kolkata");
  }

  // Always return UTC date
  return dt.toUTC().toJSDate();
}
