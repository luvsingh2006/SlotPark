import { CarIcon, EvIcon, BikeIcon, TruckIcon, AccessibleIcon } from './Icons'
import './ParkingSlot.css'

const VEHICLE_ICONS = {
  car: CarIcon,
  ev: EvIcon,
  bike: BikeIcon,
  truck: TruckIcon,
  accessible: AccessibleIcon,
}

export function ParkingSlot({
  id,
  label = '',
  vehicleType = 'car',
  status = 'available',
  rotation = 0,
  width,
  height,
  section,
  onClick,
  className = '',
  style = {},
}) {
  const IconComponent = VEHICLE_ICONS[vehicleType] || CarIcon

  const customStyle = {
    ...style,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
  }

  const handleClick = (e) => {
    if (status === 'disabled') return
    if (onClick) {
      onClick({ id, label, vehicleType, status, rotation, section }, e)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(e)
    }
  }

  return (
    <div
      role="button"
      tabIndex={status === 'disabled' ? -1 : 0}
      className={`parking-slot parking-slot--${status} parking-slot--${vehicleType} ${className}`}
      style={customStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={`${label || id} (${vehicleType} - ${status})`}
      data-slot-id={id}
    >
      <div className="parking-slot__header">
        {section && <span className="parking-slot__section">{section}</span>}
        <span className="parking-slot__badge">{status}</span>
      </div>

      <div className="parking-slot__body">
        <IconComponent className="parking-slot__icon" size={24} />
      </div>

      <div className="parking-slot__footer">
        <span className="parking-slot__label">{label || id}</span>
      </div>
    </div>
  )
}
