import { formatDisplayTime, formatDuration } from '../utils/timeHelpers'
import { BOOKING_STATUS } from '../utils/bookingHelpers'
import { EmptyState } from './EmptyState'
import './ActiveBookingsDrawer.css'

export function ActiveBookingsDrawer({ isOpen, onClose, bookings = [], objects = [], onCancelBooking }) {
  if (!isOpen) return null

  const activeBookings = bookings
    .filter((b) => b.status === BOOKING_STATUS.ACTIVE)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

  const getSlotLabel = (slotId) => objects.find((o) => o.id === slotId)?.label || slotId

  return (
    <>
      <div className="bookings-drawer__backdrop" onClick={onClose} />
      <aside className="bookings-drawer" role="dialog" aria-label="Active Bookings">
        <div className="bookings-drawer__header">
          <h3>Active Reservations</h3>
          <button type="button" className="modal-card__close" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div className="bookings-drawer__list">
          {activeBookings.length === 0 ? (
            <EmptyState
              title="No reservations yet"
              subtitle="Pick a time window and select an available slot to make your first booking."
            />
          ) : (
            activeBookings.map((booking) => (
              <div key={booking.id} className="bookings-drawer__item">
                <div className="bookings-drawer__item-top">
                  <span className="bookings-drawer__slot">Slot {getSlotLabel(booking.slotId)}</span>
                  <span className="bookings-drawer__ref">{booking.reference}</span>
                </div>
                <p className="bookings-drawer__driver">
                  {booking.driverName} · {booking.vehiclePlate}
                </p>
                <p className="bookings-drawer__time">
                  {formatDisplayTime(booking.startTime)} → {formatDisplayTime(booking.endTime)}
                  <span className="bookings-drawer__duration">
                    {formatDuration(booking.startTime, booking.endTime)}
                  </span>
                </p>
                <button
                  type="button"
                  className="bookings-drawer__cancel"
                  onClick={() => onCancelBooking && onCancelBooking(booking.id)}
                >
                  Cancel Reservation
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  )
}
