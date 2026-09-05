import { useMemo } from 'react'
import {
  CarIcon,
  EvIcon,
  AccessibleIcon,
  BikeIcon,
  TruckIcon,
} from './Icons'
import { isSlotType, OBJECT_TYPES } from '../utils/layoutModels'
import './ParkingStatsBar.css'

export function ParkingStatsBar({
  objects = [],
  activeFilter = null,
  onSelectFilter,
}) {
  const stats = useMemo(() => {
    const slots = objects.filter((o) => isSlotType(o.type))
    const totalSlots = slots.length

    // Status breakdown
    const available = slots.filter((s) => !s.status || s.status === 'available').length
    const occupied = slots.filter((s) => s.status === 'occupied').length
    const reserved = slots.filter((s) => s.status === 'reserved').length
    const disabled = slots.filter((s) => s.status === 'disabled').length

    // Vehicle type breakdown
    const cars = slots.filter((s) => s.type === OBJECT_TYPES.PARKING || s.vehicleType === 'car').length
    const evs = slots.filter((s) => s.type === OBJECT_TYPES.EV || s.vehicleType === 'ev').length
    const accessible = slots.filter((s) => s.type === OBJECT_TYPES.ACCESSIBLE || s.vehicleType === 'accessible').length
    const bikes = slots.filter((s) => s.type === OBJECT_TYPES.BIKE || s.vehicleType === 'bike').length
    const trucks = slots.filter((s) => s.type === OBJECT_TYPES.TRUCK || s.vehicleType === 'truck').length

    // Occupancy rate
    const occupancyRate = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0
    const availableRate = totalSlots > 0 ? Math.round((available / totalSlots) * 100) : 0

    // Zone / Section breakdown
    const zones = {}
    slots.forEach((s) => {
      const zoneName = s.section?.trim() || 'General'
      zones[zoneName] = (zones[zoneName] || 0) + 1
    })

    return {
      totalSlots,
      available,
      occupied,
      reserved,
      disabled,
      cars,
      evs,
      accessible,
      bikes,
      trucks,
      occupancyRate,
      availableRate,
      zones,
    }
  }, [objects])

  const handleFilterClick = (filterKey) => {
    if (!onSelectFilter) return
    if (activeFilter === filterKey) {
      onSelectFilter(null)
    } else {
      onSelectFilter(filterKey)
    }
  }

  return (
    <div className="parking-stats-bar" role="region" aria-label="Parking Lot Statistics">
      {/* Capacity & Occupancy Overview */}
      <div className="stats-metric-group stats-metric-group--capacity">
        <div className="stats-capacity-info">
          <div className="stats-capacity-number">
            <span className="stats-capacity-val">{stats.totalSlots}</span>
            <span className="stats-capacity-label">Total Stalls</span>
          </div>
          <div className="stats-occupancy-badge" title={`${stats.available} Available, ${stats.occupied} Occupied`}>
            <span className="stats-occupancy-percent">{stats.occupancyRate}%</span>
            <span className="stats-occupancy-text">Occupied</span>
          </div>
        </div>

        {/* Visual Multi-Segment Capacity Fill Bar */}
        {stats.totalSlots > 0 && (
          <div className="stats-capacity-bar" title={`Available: ${stats.available} | Occupied: ${stats.occupied} | Reserved: ${stats.reserved}`}>
            <div
              className="stats-segment stats-segment--available"
              style={{ width: `${(stats.available / stats.totalSlots) * 100}%` }}
            />
            <div
              className="stats-segment stats-segment--occupied"
              style={{ width: `${(stats.occupied / stats.totalSlots) * 100}%` }}
            />
            <div
              className="stats-segment stats-segment--reserved"
              style={{ width: `${(stats.reserved / stats.totalSlots) * 100}%` }}
            />
            <div
              className="stats-segment stats-segment--disabled"
              style={{ width: `${(stats.disabled / stats.totalSlots) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="stats-divider" />

      {/* Vehicle Category Breakdown Badges */}
      <div className="stats-metric-group stats-metric-group--types">
        <span className="stats-group-title">Vehicles:</span>
        <div className="stats-pills">
          <button
            type="button"
            className={`stats-pill ${activeFilter === 'car' ? 'stats-pill--active' : ''}`}
            onClick={() => handleFilterClick('car')}
            title="Filter Standard Car spaces"
          >
            <CarIcon size={14} />
            <span className="stats-pill__label">Car</span>
            <span className="stats-pill__count">{stats.cars}</span>
          </button>

          <button
            type="button"
            className={`stats-pill stats-pill--ev ${activeFilter === 'ev' ? 'stats-pill--active' : ''}`}
            onClick={() => handleFilterClick('ev')}
            title="Filter EV Charging stations"
          >
            <EvIcon size={14} />
            <span className="stats-pill__label">EV</span>
            <span className="stats-pill__count">{stats.evs}</span>
          </button>

          <button
            type="button"
            className={`stats-pill stats-pill--accessible ${activeFilter === 'accessible' ? 'stats-pill--active' : ''}`}
            onClick={() => handleFilterClick('accessible')}
            title="Filter ADA Accessible spaces"
          >
            <AccessibleIcon size={14} />
            <span className="stats-pill__label">ADA</span>
            <span className="stats-pill__count">{stats.accessible}</span>
          </button>

          <button
            type="button"
            className={`stats-pill stats-pill--bike ${activeFilter === 'bike' ? 'stats-pill--active' : ''}`}
            onClick={() => handleFilterClick('bike')}
            title="Filter Bike / Motorcycle spaces"
          >
            <BikeIcon size={14} />
            <span className="stats-pill__label">Bike</span>
            <span className="stats-pill__count">{stats.bikes}</span>
          </button>

          <button
            type="button"
            className={`stats-pill stats-pill--truck ${activeFilter === 'truck' ? 'stats-pill--active' : ''}`}
            onClick={() => handleFilterClick('truck')}
            title="Filter Truck / Cargo bays"
          >
            <TruckIcon size={14} />
            <span className="stats-pill__label">Truck</span>
            <span className="stats-pill__count">{stats.trucks}</span>
          </button>
        </div>
      </div>

      <div className="stats-divider" />

      {/* Real-time Status Counts */}
      <div className="stats-metric-group stats-metric-group--status">
        <span className="stats-group-title">Status:</span>
        <div className="stats-status-list">
          <button
            type="button"
            className={`stats-status-item ${activeFilter === 'status:available' ? 'stats-status-item--active' : ''}`}
            onClick={() => handleFilterClick('status:available')}
            title="Available slots"
          >
            <span className="status-dot status-dot--available" />
            <span className="status-label">Available</span>
            <span className="status-count">{stats.available}</span>
          </button>

          <button
            type="button"
            className={`stats-status-item ${activeFilter === 'status:occupied' ? 'stats-status-item--active' : ''}`}
            onClick={() => handleFilterClick('status:occupied')}
            title="Occupied slots"
          >
            <span className="status-dot status-dot--occupied" />
            <span className="status-label">Occupied</span>
            <span className="status-count">{stats.occupied}</span>
          </button>

          <button
            type="button"
            className={`stats-status-item ${activeFilter === 'status:reserved' ? 'stats-status-item--active' : ''}`}
            onClick={() => handleFilterClick('status:reserved')}
            title="Reserved slots"
          >
            <span className="status-dot status-dot--reserved" />
            <span className="status-label">Reserved</span>
            <span className="status-count">{stats.reserved}</span>
          </button>
        </div>
      </div>

      {/* Active Filter Clear Tag */}
      {activeFilter && (
        <div className="stats-active-filter">
          <span className="stats-filter-tag">
            Filtered: {activeFilter.replace('status:', 'Status: ')}
            <button
              type="button"
              className="stats-filter-clear"
              onClick={() => onSelectFilter(null)}
              title="Clear Filter (Esc)"
            >
              ✕
            </button>
          </span>
        </div>
      )}
    </div>
  )
}
