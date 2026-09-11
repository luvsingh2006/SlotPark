/**
 * Core booking data model and conflict-detection logic.
 *
 * A BookingRecord looks like:
 * {
 *   id: string,
 *   slotId: string,       // references a LayoutObject.id
 *   driverName: string,
 *   vehiclePlate: string,
 *   startTime: string,    // ISO 8601
 *   endTime: string,      // ISO 8601
 *   status: 'active' | 'cancelled',
 * }
 */

export const BOOKING_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
}

/**
 * Generate a short, human-readable booking reference code, e.g. "PS-7K2M9A".
 * Not cryptographically unique — fine for a demo project's ticket display.
 */
export function generateBookingReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `PS-${code}`
}

/**
 * Two time intervals [aStart, aEnd] and [bStart, bEnd] overlap if
 * aStart < bEnd AND aEnd > bStart. Equal-length back-to-back bookings
 * (one ends exactly when the other starts) do NOT count as a conflict.
 */
export function doTimeRangesOverlap(aStart, aEnd, bStart, bEnd) {
  const aStartMs = new Date(aStart).getTime()
  const aEndMs = new Date(aEnd).getTime()
  const bStartMs = new Date(bStart).getTime()
  const bEndMs = new Date(bEnd).getTime()

  return aStartMs < bEndMs && aEndMs > bStartMs
}

/**
 * Check whether a specific slot is free for a requested [startTime, endTime]
 * window, given the full list of existing bookings. Cancelled bookings are
 * ignored — they no longer occupy the slot.
 */
export function isSlotAvailable(slotId, startTime, endTime, allBookings = []) {
  const relevantBookings = allBookings.filter(
    (booking) => booking.slotId === slotId && booking.status === BOOKING_STATUS.ACTIVE
  )

  const hasConflict = relevantBookings.some((booking) =>
    doTimeRangesOverlap(startTime, endTime, booking.startTime, booking.endTime)
  )

  return !hasConflict
}

/**
 * Given every layout object and a requested time window, return a Set of
 * slot IDs that are unavailable (booked) for that window. Non-slot objects
 * (roads, walls, etc.) are ignored — only objects with an id + booking
 * relevance are checked by the caller.
 */
export function getUnavailableSlotIds(slotIds, startTime, endTime, allBookings = []) {
  if (!startTime || !endTime) return new Set()

  const unavailable = new Set()
  for (const slotId of slotIds) {
    if (!isSlotAvailable(slotId, startTime, endTime, allBookings)) {
      unavailable.add(slotId)
    }
  }
  return unavailable
}
