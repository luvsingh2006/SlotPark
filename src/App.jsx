import { useState } from 'react'
import { ParkingSlot } from './components/ParkingSlot'
import { SlotInspector } from './components/SlotInspector'
import './App.css'

const INITIAL_SLOTS = [
  {
    id: 'slot-1',
    label: 'A-01',
    vehicleType: 'car',
    status: 'available',
    section: 'Zone A',
    rotation: 0,
  },
  {
    id: 'slot-2',
    label: 'A-02',
    vehicleType: 'car',
    status: 'occupied',
    section: 'Zone A',
    rotation: 0,
  },
  {
    id: 'slot-3',
    label: 'EV-01',
    vehicleType: 'ev',
    status: 'available',
    section: 'Zone A',
    rotation: 0,
  },
  {
    id: 'slot-4',
    label: 'B-01',
    vehicleType: 'bike',
    status: 'reserved',
    section: 'Zone B',
    rotation: 45,
  },
  {
    id: 'slot-5',
    label: 'B-02',
    vehicleType: 'bike',
    status: 'available',
    section: 'Zone B',
    rotation: 45,
  },
  {
    id: 'slot-6',
    label: 'T-01',
    vehicleType: 'truck',
    status: 'available',
    section: 'Cargo',
    rotation: 90,
  },
  {
    id: 'slot-7',
    label: 'ACC-01',
    vehicleType: 'accessible',
    status: 'available',
    section: 'Front',
    rotation: 0,
  },
]

function App() {
  const [slots, setSlots] = useState(INITIAL_SLOTS)
  const [selectedSlotId, setSelectedSlotId] = useState('slot-1')

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || null

  const handleSlotClick = (slot) => {
    setSelectedSlotId((prevId) => (prevId === slot.id ? null : slot.id))
  }

  const updateSelectedSlot = (updates) => {
    setSlots((prevSlots) =>
      prevSlots.map((s) => (s.id === selectedSlotId ? { ...s, ...updates } : s))
    )
  }

  const handleDeleteSlot = (slotId) => {
    setSlots((prevSlots) => prevSlots.filter((s) => s.id !== slotId))
    if (selectedSlotId === slotId) {
      setSelectedSlotId(null)
    }
  }

  const handleAddSlot = () => {
    const nextIndex = slots.length + 1
    const newSlot = {
      id: `slot-${Date.now()}`,
      label: `A-${String(nextIndex).padStart(2, '0')}`,
      vehicleType: 'car',
      status: 'available',
      section: 'Zone A',
      rotation: 0,
    }
    setSlots((prev) => [...prev, newSlot])
    setSelectedSlotId(newSlot.id)
  }

  const toggleSlotStatus = (slotId) => {
    const statusCycle = ['available', 'occupied', 'reserved']
    setSlots((prevSlots) =>
      prevSlots.map((s) => {
        if (s.id === slotId) {
          const currentIndex = statusCycle.indexOf(s.status)
          const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length]
          return { ...s, status: nextStatus }
        }
        return s
      })
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__title">
          <h1>SlotPark</h1>
          <span className="app-header__subtitle">Core Slot Components & State</span>
        </div>
        <div className="app-header__actions">
          <button type="button" className="btn btn--primary" onClick={handleAddSlot}>
            Add Slot
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="slot-grid-panel">
          <div className="panel-header">
            <div>
              <h2>Parking Slots ({slots.length})</h2>
              <span className="panel-hint">Select a slot to edit or cycle state directly</span>
            </div>
          </div>

          <div className="slots-container">
            {slots.map((slot) => {
              const isSelected = slot.id === selectedSlotId
              const displayStatus = isSelected ? 'selected' : slot.status

              return (
                <div key={slot.id} className="slot-wrapper">
                  <ParkingSlot
                    id={slot.id}
                    label={slot.label}
                    vehicleType={slot.vehicleType}
                    status={displayStatus}
                    rotation={slot.rotation}
                    section={slot.section}
                    onClick={handleSlotClick}
                  />
                  <button
                    type="button"
                    className="btn btn--small btn--subtle"
                    onClick={() => toggleSlotStatus(slot.id)}
                  >
                    Cycle State
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        <SlotInspector
          slot={selectedSlot}
          onUpdate={updateSelectedSlot}
          onDeselect={() => setSelectedSlotId(null)}
          onDelete={handleDeleteSlot}
        />
      </main>
    </div>
  )
}

export default App
