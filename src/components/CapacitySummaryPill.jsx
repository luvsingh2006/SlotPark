import { useMemo } from 'react'
import { isSlotType } from '../utils/layoutModels'
import './CapacitySummaryPill.css'

export function CapacitySummaryPill({ objects = [], unavailableSlotIds = new Set(), hasActiveWindow = false }) {
  const { totalSlots, availableCount } = useMemo(() => {
    const slots = objects.filter((o) => isSlotType(o.type))
    const total = slots.length
    const available = hasActiveWindow
      ? slots.filter((s) => !unavailableSlotIds.has(s.id)).length
      : total
    return { totalSlots: total, availableCount: available }
  }, [objects, unavailableSlotIds, hasActiveWindow])

  const isLow = hasActiveWindow && totalSlots > 0 && availableCount / totalSlots <= 0.2

  return (
    <div className={`capacity-pill ${isLow ? 'capacity-pill--low' : ''}`}>
      <span className="capacity-pill__count">{availableCount}</span>
      <span className="capacity-pill__label">of {totalSlots} slots available</span>
      {!hasActiveWindow && <span className="capacity-pill__hint">(pick a time to check availability)</span>}
    </div>
  )
}
