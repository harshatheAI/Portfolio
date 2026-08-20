/**
 * Lightweight distance estimation. With a maps API key you'd geocode + route;
 * here we approximate from ZIP codes so quotes work offline. Good enough to
 * drive the mileage line item and be replaced later.
 */
export function estimateDistanceMiles(originZip?: string | null, destZip?: string | null): number {
  const a = parseInt((originZip || "").slice(0, 5), 10);
  const b = parseInt((destZip || "").slice(0, 5), 10);
  if (Number.isNaN(a) || Number.isNaN(b)) return 12; // local move default
  if (a === b) return 8;

  const diff = Math.abs(a - b);
  // Same 3-digit prefix ≈ same metro (a few miles); larger gaps scale up.
  const prefixSame = Math.floor(a / 100) === Math.floor(b / 100);
  if (prefixSame) return Math.min(45, 6 + (diff % 100) * 0.6);

  // Rough: ~ 0.9 miles per ZIP-unit within a region, capped for sanity.
  const miles = Math.min(1200, 15 + diff * 0.9);
  return Math.round(miles);
}

export function isLocalMove(distanceMiles: number): boolean {
  return distanceMiles <= 50;
}
