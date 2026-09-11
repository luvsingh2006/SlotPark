import { formatDisplayTime, formatDuration } from '../utils/timeHelpers'
import './ParkingPassCard.css'

export function ParkingPassCard({ booking, slotLabel }) {
  if (!booking) return null

  return (
    <div className="parking-pass">
      <div className="parking-pass__top">
        <div>
          <p className="parking-pass__eyebrow">Digital Parking Pass</p>
          <h3 className="parking-pass__slot">Slot {slotLabel}</h3>
        </div>
        <span className="parking-pass__status">CONFIRMED</span>
      </div>

      <div className="parking-pass__perforation" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className="parking-pass__body">
        <div className="parking-pass__row">
          <span className="parking-pass__label">Driver</span>
          <span className="parking-pass__value">{booking.driverName}</span>
        </div>
        <div className="parking-pass__row">
          <span className="parking-pass__label">Vehicle Plate</span>
          <span className="parking-pass__value">{booking.vehiclePlate}</span>
        </div>
        <div className="parking-pass__row">
          <span className="parking-pass__label">Entry</span>
          <span className="parking-pass__value">{formatDisplayTime(booking.startTime)}</span>
        </div>
        <div className="parking-pass__row">
          <span className="parking-pass__label">Exit</span>
          <span className="parking-pass__value">{formatDisplayTime(booking.endTime)}</span>
        </div>
        <div className="parking-pass__row">
          <span className="parking-pass__label">Duration</span>
          <span className="parking-pass__value">{formatDuration(booking.startTime, booking.endTime)}</span>
        </div>
      </div>

      <div className="parking-pass__footer">
        <span className="parking-pass__ref-label">Reference</span>
        <span className="parking-pass__ref-code">{booking.reference}</span>
      </div>
    </div>
  )
}
