import { useState } from 'react'
import { formatDisplayTime, formatDuration } from '../utils/timeHelpers'
import { validateBookingForm } from '../utils/bookingValidation'
import './BookingModal.css'

/**
 * Reservation dialog shown when a visitor confirms a slot + time window.
 * Collects driver name and vehicle plate, validated client-side before
 * the reservation can be confirmed.
 */
export function BookingModal({ isOpen = false, onClose, slot, bookingWindow, onConfirm }) {
  const [driverName, setDriverName] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [touched, setTouched] = useState({})

  if (!isOpen || !slot || !bookingWindow) return null

  const errors = validateBookingForm({ driverName, vehiclePlate })
  const isValid = Object.keys(errors).length === 0

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ driverName: true, vehiclePlate: true })
    if (!isValid) return

    onConfirm({
      slotId: slot.id,
      driverName: driverName.trim(),
      vehiclePlate: vehiclePlate.trim(),
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
                className={`form-input ${touched.driverName && errors.driverName ? 'form-input--error' : ''}`}
                value={driverName}
                placeholder="e.g. Ramesh Kumar"
                onChange={(e) => setDriverName(e.target.value)}
                onBlur={() => handleBlur('driverName')}
              />
              {touched.driverName && errors.driverName && (
                <span className="form-error">{errors.driverName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="booking-vehicle-plate">Vehicle Plate Number</label>
              <input
                id="booking-vehicle-plate"
                type="text"
                className={`form-input ${touched.vehiclePlate && errors.vehiclePlate ? 'form-input--error' : ''}`}
                value={vehiclePlate}
                placeholder="e.g. DL 4C AB 1234"
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                onBlur={() => handleBlur('vehiclePlate')}
              />
              {touched.vehiclePlate && errors.vehiclePlate && (
                <span className="form-error">{errors.vehiclePlate}</span>
              )}
            </div>

            <p className="booking-modal__fee">Fee: FREE (Demo Project)</p>
          </div>

          <div className="modal-card__footer">
            <button type="button" className="btn btn--subtle" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={!isValid}>
              Confirm Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
