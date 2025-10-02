import { DateTime } from 'luxon';

// Parse a CodeChef IST datetime string into a UTC Date
// Tries multiple common formats defensively and assumes Asia/Kolkata when no offset is present.
export function parseISTtoUTC(dateStr: string): Date {
  const attempts = [
    () => DateTime.fromISO(dateStr, { zone: 'Asia/Kolkata' }),
    () => DateTime.fromFormat(dateStr, 'yyyy-LL-dd HH:mm:ss', { zone: 'Asia/Kolkata' }),
    () => DateTime.fromRFC2822(dateStr, { zone: 'Asia/Kolkata' }),
    () => {
      // Last resort: let JS parse, then force zone to IST
      const js = new Date(dateStr);
      return DateTime.fromJSDate(js).setZone('Asia/Kolkata');
    }
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

  // If all parsing fails, fall back to JS Date -> UTC as-is (may already include offset)
  const fallback = new Date(dateStr);
  return new Date(fallback.getTime());
}
