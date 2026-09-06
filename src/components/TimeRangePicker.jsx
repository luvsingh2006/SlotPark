import { useEffect, useState } from 'react'
import { getMinBookableLocal, localInputToIso, validateTimeRange } from '../utils/timeHelpers'
import './TimeRangePicker.css'

/**
 * Lets a visitor pick an entry/exit time window. Reports a validated
 * { startTime, endTime } (ISO strings) upward via onChange whenever both
 * values are present and valid; reports null while incomplete or invalid.
 */
export function TimeRangePicker({ onChange }) {
  const [startLocal, setStartLocal] = useState('')
  const [endLocal, setEndLocal] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!startLocal || !endLocal) {
      setError(null)
      onChange && onChange(null)
      return
    }

    const startTime = localInputToIso(startLocal)
    const endTime = localInputToIso(endLocal)
    const result = validateTimeRange(startTime, endTime)

    setError(result.error)
    onChange && onChange(result.valid ? { startTime, endTime } : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLocal, endLocal])

  const minLocal = getMinBookableLocal()

  return (
    <div className="time-range-picker">
      <div className="time-range-picker__row">
        <label className="time-range-picker__field">
          <span className="time-range-picker__label">Entry Time</span>
          <input
            type="datetime-local"
            value={startLocal}
            min={minLocal}
            onChange={(e) => setStartLocal(e.target.value)}
          />
        </label>

        <label className="time-range-picker__field">
          <span className="time-range-picker__label">Exit Time</span>
          <input
            type="datetime-local"
            value={endLocal}
            min={startLocal || minLocal}
            onChange={(e) => setEndLocal(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="time-range-picker__error">{error}</p>}
    </div>
  )
}
