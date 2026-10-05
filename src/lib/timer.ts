export const DEFAULT_TIME = 25 * 60;
export function remainingSeconds(deadline: number, now = Date.now()) {
  return Math.max(0, Math.min(DEFAULT_TIME, Math.ceil((deadline - now) / 1000)));
}
