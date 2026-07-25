import redis from "../libs/redis";

// Short-lived Redis holds on seats so two users can't check out the same
// seat at once, without needing a DB write (and its locking overhead) for
// every click. A lock is just a key: lock:show:<showId>:seat:<seatId> -> userId,
// with a TTL. Once payment is confirmed the seat is "locked in" permanently
// by the Booking document itself (see booking.controller); the Redis lock is
// only needed for the checkout window in between.

export const DEFAULT_LOCK_TTL_SECONDS = 5 * 60; // 5 minute hold, same as most booking flows

const lockKey = (showId: string, seatId: string) => `lock:show:${showId}:seat:${seatId}`;

// Atomically locks every seat in `seatIds`, or none at all.
// A seat already locked by the SAME userId is treated as "still mine" and
// its TTL is refreshed (so re-calling this also works as "extend my hold").
// Returns { success: true } or { success: false, conflictSeatIds } listing
// which seats are held by someone else.
const LOCK_SCRIPT = `
local n = #KEYS
for i = 1, n do
  local owner = redis.call('GET', KEYS[i])
  if owner and owner ~= ARGV[1] then
    return owner .. '::' .. KEYS[i]
  end
end
for i = 1, n do
  redis.call('SET', KEYS[i], ARGV[1], 'EX', ARGV[2])
end
return 'OK'
`;

export async function lockSeats(
  showId: string,
  seatIds: string[],
  userId: string,
  ttlSeconds: number = DEFAULT_LOCK_TTL_SECONDS
): Promise<{ success: true } | { success: false; conflictSeatId: string }> {
  if (seatIds.length === 0) return { success: true };
  const keys = seatIds.map((id) => lockKey(showId, id));
  const result = (await redis.eval(
    LOCK_SCRIPT,
    keys.length,
    ...keys,
    userId,
    String(ttlSeconds)
  )) as string;

  if (result === "OK") return { success: true };
  const [, conflictKey] = result.split("::");
  const conflictSeatId = conflictKey.split(":seat:")[1];
  return { success: false, conflictSeatId };
}

// Releases only the locks owned by `userId` (won't accidentally clear
// someone else's hold).
export async function unlockSeats(showId: string, seatIds: string[], userId: string): Promise<void> {
  if (seatIds.length === 0) return;
  const pipeline = redis.pipeline();
  for (const seatId of seatIds) {
    pipeline.get(lockKey(showId, seatId));
  }
  const owners = await pipeline.exec();

  const delPipeline = redis.pipeline();
  seatIds.forEach((seatId, i) => {
    const owner = owners?.[i]?.[1] as string | null;
    if (owner === userId) delPipeline.del(lockKey(showId, seatId));
  });
  await delPipeline.exec();
}

// Returns a map of seatId -> userId for every currently-locked seat among
// `seatIds` (locked-by-nobody seats are simply omitted from the result).
export async function getLockedSeatMap(
  showId: string,
  seatIds: string[]
): Promise<Record<string, string>> {
  if (seatIds.length === 0) return {};
  const pipeline = redis.pipeline();
  for (const seatId of seatIds) {
    pipeline.get(lockKey(showId, seatId));
  }
  const results = await pipeline.exec();

  const locked: Record<string, string> = {};
  seatIds.forEach((seatId, i) => {
    const owner = results?.[i]?.[1] as string | null;
    if (owner) locked[seatId] = owner;
  });
  return locked;
}

// Verifies every seat in `seatIds` is currently locked BY `userId` — used by
// the Booking API right before it converts a hold into a real booking.
export async function verifyOwnedLocks(showId: string, seatIds: string[], userId: string): Promise<boolean> {
  const locked = await getLockedSeatMap(showId, seatIds);
  return seatIds.every((id) => locked[id] === userId);
}
