import { useState } from 'react'
import { formatDisplayTime, formatDuration } from '../utils/timeHelpers'
import './BookingModal.css'

/**
 * Reservation dialog shown when a visitor confirms a slot + time window.
 * Collects driver name and vehicle plate. Validation is added in the next
 * commit — for now this just captures the raw input values.
 */
export function BookingModal({ isOpen = false, onClose, slot, bookingWindow, onConfirm }) {
  const [driverName, setDriverName] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')

  if (!isOpen || !slot || !bookingWindow) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm({
      slotId: slot.id,
      driverName,
      vehiclePlate,
      startTime: bookingWindow.startTime,
      endTime: bookingWindow.endTime,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card booking-modal"
        role="dialog"
        aria-label="Reserve Parking Slot"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-card__header">
          <div className="modal-card__title">
            <h3>Reserve Slot {slot.label || slot.id}</h3>
          </div>
          <button type="button" className="modal-card__close" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-card__body">
            <div className="booking-modal__summary">
              <span>
                {formatDisplayTime(bookingWindow.startTime)} → {formatDisplayTime(bookingWindow.endTime)}
              </span>
              <span className="booking-modal__duration">
                {formatDuration(bookingWindow.startTime, bookingWindow.endTime)}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="booking-driver-name">Driver Name</label>
              <input
                id="booking-driver-name"
                type="text"
                className="form-input"
                value={driverName}
                placeholder="e.g. Ramesh Kumar"
                onChange={(e) => setDriverName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="booking-vehicle-plate">Vehicle Plate Number</label>
              <input
                id="booking-vehicle-plate"
                type="text"
                className="form-input"
                value={vehiclePlate}
                placeholder="e.g. DL 4C AB 1234"
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                required
              />
            </div>

            <p className="booking-modal__fee">Fee: FREE (Demo Project)</p>
          </div>

          <div className="modal-card__footer">
            <button type="button" className="btn btn--subtle" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Confirm Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
