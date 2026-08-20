import { addDays, format, isSameDay, startOfDay } from "date-fns";

/**
 * Availability engine. Generates bookable days + arrival windows. In production
 * this would consult crew capacity and existing bookings; here it applies simple,
 * believable rules (closed Sundays, limited same-week slots, capacity per window).
 */

export interface TimeSlot {
  id: string; // "8:00 AM – 10:00 AM"
  label: string;
  start: string;
  capacity: number;
  booked: number;
}

export interface DayAvailability {
  date: string; // yyyy-MM-dd
  label: string; // "Tue, Aug 26"
  weekday: string;
  isOpen: boolean;
  slots: TimeSlot[];
}

const WINDOWS = [
  { start: "8:00 AM", end: "10:00 AM" },
  { start: "10:00 AM", end: "12:00 PM" },
  { start: "12:00 PM", end: "2:00 PM" },
  { start: "2:00 PM", end: "4:00 PM" },
];

/** Deterministic pseudo-random from a string, so availability is stable per day. */
function seed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

export function generateAvailability(
  fromDate: Date = new Date(),
  days = 21,
  existingByDateSlot: Record<string, number> = {},
): DayAvailability[] {
  const out: DayAvailability[] = [];
  const today = startOfDay(fromDate);

  for (let i = 1; i <= days; i++) {
    const date = addDays(today, i);
    const ymd = format(date, "yyyy-MM-dd");
    const weekday = format(date, "EEEE");
    const isSunday = date.getDay() === 0;

    const daySeed = seed(ymd);
    const slots: TimeSlot[] = WINDOWS.map((w, idx) => {
      const id = `${w.start} – ${w.end}`;
      const capacity = 2 + ((daySeed >> idx) % 2); // 2–3 crews per window
      const pseudoBooked = (daySeed >> (idx + 3)) % (capacity + 1);
      const booked = existingByDateSlot[`${ymd}|${id}`] ?? pseudoBooked;
      return { id, label: id, start: w.start, capacity, booked };
    });

    out.push({
      date: ymd,
      label: format(date, "EEE, MMM d"),
      weekday,
      isOpen: !isSunday,
      slots: isSunday ? [] : slots,
    });
  }
  return out;
}

export function isSlotAvailable(day: DayAvailability, slotId: string): boolean {
  const slot = day.slots.find((s) => s.id === slotId);
  return !!slot && slot.booked < slot.capacity;
}

export function firstAvailable(days: DayAvailability[]): { date: string; slot: string } | null {
  for (const d of days) {
    if (!d.isOpen) continue;
    const s = d.slots.find((x) => x.booked < x.capacity);
    if (s) return { date: d.date, slot: s.id };
  }
  return null;
}

export { isSameDay };
