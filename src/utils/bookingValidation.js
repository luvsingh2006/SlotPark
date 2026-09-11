const PLATE_PATTERN = /^[A-Z0-9\- ]{4,15}$/

/**
 * Validate the reservation form fields. Returns a map of field -> error
 * message; a field with no error is omitted from the map. Check
 * Object.keys(errors).length === 0 to know if the form is valid overall.
 */
export function validateBookingForm({ driverName, vehiclePlate }) {
  const errors = {}

  const trimmedName = (driverName || '').trim()
  if (!trimmedName) {
    errors.driverName = 'Driver name is required.'
  } else if (trimmedName.length < 2) {
    errors.driverName = 'Driver name is too short.'
  }

  const trimmedPlate = (vehiclePlate || '').trim()
  if (!trimmedPlate) {
    errors.vehiclePlate = 'Vehicle plate number is required.'
  } else if (!PLATE_PATTERN.test(trimmedPlate)) {
    errors.vehiclePlate = 'Enter a valid plate number (letters, numbers, spaces or hyphens).'
  }

  return errors
}
