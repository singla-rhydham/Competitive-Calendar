import { DateTime } from "luxon";

/**
 * Parses a CodeChef IST datetime string and converts it to UTC Date object.
 * CodeChef format: "08 Oct 2025  20:00:00" (note: double space between date and time)
 * 
 * @param dateStr - Date string from CodeChef API in IST timezone
 * @returns UTC Date object ready for MongoDB storage
 * 
 * @example
 * parseISTtoUTC("08 Oct 2025  20:00:00") 
 * // Returns: Date object representing "2025-10-08T14:30:00.000Z" (UTC)
 */
export function parseISTtoUTC(dateStr: string): Date {
  // Parse the CodeChef date format as IST (Asia/Kolkata) timezone
  const istDateTime = DateTime.fromFormat(dateStr, "dd LLL yyyy  HH:mm:ss", {
    zone: "Asia/Kolkata",
  });

  // Validate the parse was successful
  if (!istDateTime.isValid) {
    console.error(`Failed to parse CodeChef date: "${dateStr}". Error: ${istDateTime.invalidReason}`);
    // Fallback: try standard JS Date parsing
    return new Date(dateStr);
  }

  // Convert to UTC and return as JavaScript Date object
  return istDateTime.toUTC().toJSDate();
}
