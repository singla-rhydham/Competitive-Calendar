import { DateTime } from "luxon";

/**
 * CodeChef publishes contest times in IST (Asia/Kolkata).
 * This function ensures we parse them as IST and then convert to UTC.
 */
export function parseCodeChefIST(dateStr: string): Date {
  // Force zone Asia/Kolkata
  const dt = DateTime.fromFormat(dateStr.trim(), "yyyy-LL-dd HH:mm:ss", {
    zone: "Asia/Kolkata",
  });

  if (dt.isValid) {
    return dt.toUTC().toJSDate();
  }

  // fallback: JS parse + set IST
  const js = new Date(dateStr);
  return DateTime.fromJSDate(js, { zone: "Asia/Kolkata" }).toUTC().toJSDate();
}
