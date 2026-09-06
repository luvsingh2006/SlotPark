import { EvIcon, AccessibleIcon, BikeIcon, TruckIcon, CarIcon } from './Icons'
import { OBJECT_TYPES } from '../utils/layoutModels'
import './VehicleTypeFilterBar.css'

const FILTER_OPTIONS = [
  { type: OBJECT_TYPES.PARKING, label: 'Car', Icon: CarIcon },
  { type: OBJECT_TYPES.EV, label: 'EV', Icon: EvIcon },
  { type: OBJECT_TYPES.ACCESSIBLE, label: 'Accessible', Icon: AccessibleIcon },
  { type: OBJECT_TYPES.BIKE, label: 'Bike', Icon: BikeIcon },
  { type: OBJECT_TYPES.TRUCK, label: 'Truck', Icon: TruckIcon },
]

/**
 * A row of toggle chips letting the visitor highlight slots of one vehicle
 * type at a time. `activeType` is null when no filter is applied.
 */
export function VehicleTypeFilterBar({ activeType, onChange }) {
  return (
    <div className="vehicle-filter-bar" role="group" aria-label="Filter by vehicle type">
      {FILTER_OPTIONS.map(({ type, label, Icon }) => {
        const isActive = activeType === type
        return (
          <button
            key={type}
            type="button"
            className={`vehicle-filter-chip ${isActive ? 'vehicle-filter-chip--active' : ''}`}
            onClick={() => onChange(isActive ? null : type)}
            aria-pressed={isActive}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
