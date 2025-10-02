import { DateTime } from "luxon";

// Parse a CodeChef IST datetime string into a UTC Date
export function parseISTtoUTC(dateStr: string): Date {
  // Normalize: "2025-10-25 17:30:00" -> "2025-10-25T17:30:00"
  let normalized = dateStr.replace(" ", "T");

  const attempts = [
    () => DateTime.fromISO(normalized, { zone: "Asia/Kolkata" }),
    () => DateTime.fromFormat(dateStr, "yyyy-LL-dd HH:mm:ss", { zone: "Asia/Kolkata" }),
    () => DateTime.fromRFC2822(dateStr, { zone: "Asia/Kolkata" }),
    () => {
      const js = new Date(dateStr);
      return DateTime.fromJSDate(js).setZone("Asia/Kolkata");
    },
  ];

  for (const make of attempts) {
    try {
      const dt = make();
      if (dt.isValid) {
        return dt.toUTC().toJSDate();
      }
    } catch {
      // try next
    }
  }

  // fallback
  const fallback = new Date(dateStr);
  return new Date(fallback.getTime());
}
