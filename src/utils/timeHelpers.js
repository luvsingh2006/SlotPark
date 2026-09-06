/**
 * Time helpers for the booking system. All stored booking times are ISO 8601
 * strings (e.g. "2026-09-07T14:30:00.000Z" or local "2026-09-07T14:30").
 */

/**
 * Check whether a string is a valid, parseable date/time value.
 */
export function isValidIsoString(value) {
  if (!value || typeof value !== 'string') return false
  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime())
}

/**
 * Validate a proposed start/end pair for a booking request.
 * Returns { valid: boolean, error: string | null }.
 */
export function validateTimeRange(startTime, endTime) {
  if (!isValidIsoString(startTime) || !isValidIsoString(endTime)) {
    return { valid: false, error: 'Please select both a start and end time.' }
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  if (end <= start) {
    return { valid: false, error: 'End time must be after start time.' }
  }

  if (start < new Date()) {
    return { valid: false, error: 'Start time cannot be in the past.' }
  }

  return { valid: true, error: null }
}

/**
 * Convert a <input type="datetime-local"> value ("2026-09-07T14:30") into a
 * full ISO string for storage.
 */
export function localInputToIso(localValue) {
  if (!localValue) return null
  const date = new Date(localValue)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

/**
 * Convert a stored ISO string back into the format <input type="datetime-local">
 * expects ("2026-09-07T14:30").
 */
export function isoToLocalInput(isoValue) {
  if (!isValidIsoString(isoValue)) return ''
  const date = new Date(isoValue)
  const pad = (num) => String(num).padStart(2, '0')
  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const min = pad(date.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

/**
 * Human-readable label for a stored ISO time, e.g. "7 Sep, 2:30 PM".
 */
export function formatDisplayTime(isoValue) {
  if (!isValidIsoString(isoValue)) return '—'
  const date = new Date(isoValue)
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Duration between two ISO timestamps, formatted as "2h 30m".
 */
export function formatDuration(startTime, endTime) {
  if (!isValidIsoString(startTime) || !isValidIsoString(endTime)) return '—'
  const diffMs = new Date(endTime) - new Date(startTime)
  if (diffMs <= 0) return '—'

  const totalMinutes = Math.round(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

/**
 * The earliest valid start time a visitor can pick, as a datetime-local
 * string, so the <input min="..."> attribute blocks past times in the UI.
 */
export function getMinBookableLocal() {
  return isoToLocalInput(new Date().toISOString())
}
