/**
 * Move lifecycle + simulated live tracking.
 *
 * Booking.status walks through these stages. Progress (0–1) drives the map
 * marker and the ETA. With a real GPS/telematics feed you'd replace
 * `simulatedProgress` with the crew device location.
 */

export type MoveStatus =
  | "CONFIRMED"
  | "SCHEDULED"
  | "CREW_ASSIGNED"
  | "EN_ROUTE"
  | "LOADING"
  | "IN_TRANSIT"
  | "UNLOADING"
  | "COMPLETED"
  | "CANCELLED";

export interface StageMeta {
  status: MoveStatus;
  title: string;
  customerDetail: string;
  icon: string; // lucide icon name
  progress: number; // 0..1 position along the journey
}

export const STAGES: StageMeta[] = [
  { status: "CONFIRMED", title: "Booking confirmed", customerDetail: "Your move is on the calendar. We'll be in touch before the big day.", icon: "CalendarCheck", progress: 0 },
  { status: "CREW_ASSIGNED", title: "Crew assigned", customerDetail: "Your dedicated moving team is locked in and briefed on your move.", icon: "Users", progress: 0.12 },
  { status: "EN_ROUTE", title: "Crew en route", customerDetail: "Your movers are on their way to your pickup address.", icon: "Truck", progress: 0.3 },
  { status: "LOADING", title: "Loading", customerDetail: "We're carefully wrapping and loading your belongings.", icon: "PackageOpen", progress: 0.45 },
  { status: "IN_TRANSIT", title: "In transit", customerDetail: "Everything's loaded and on the road to your new place.", icon: "Navigation", progress: 0.72 },
  { status: "UNLOADING", title: "Unloading", customerDetail: "We're unloading and placing items where you want them.", icon: "PackageCheck", progress: 0.92 },
  { status: "COMPLETED", title: "Move complete", customerDetail: "All done! Welcome home. Thanks for moving with us.", icon: "PartyPopper", progress: 1 },
];

const ORDER: MoveStatus[] = STAGES.map((s) => s.status);

export function stageIndex(status: MoveStatus): number {
  const i = ORDER.indexOf(status);
  return i === -1 ? 0 : i;
}

export function stageFor(status: MoveStatus): StageMeta {
  return STAGES.find((s) => s.status === status) ?? STAGES[0];
}

export function nextStatus(status: MoveStatus): MoveStatus | null {
  const i = ORDER.indexOf(status);
  if (i === -1 || i >= ORDER.length - 1) return null;
  return ORDER[i + 1];
}

export function progressFor(status: MoveStatus): number {
  return stageFor(status).progress;
}

/** Friendly ETA copy based on status + minutes. */
export function etaLabel(status: MoveStatus, etaMinutes?: number | null): string {
  if (status === "COMPLETED") return "Completed";
  if (status === "CONFIRMED" || status === "SCHEDULED") return "Scheduled";
  if (etaMinutes == null) return "Updating…";
  if (status === "EN_ROUTE") return `Arriving in ~${etaMinutes} min`;
  if (status === "IN_TRANSIT") return `~${etaMinutes} min to destination`;
  return "In progress";
}

export function isActive(status: MoveStatus): boolean {
  return !["CONFIRMED", "SCHEDULED", "COMPLETED", "CANCELLED"].includes(status);
}
