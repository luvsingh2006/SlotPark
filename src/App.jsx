import { useState } from 'react'
import { ParkingSlot } from './components/ParkingSlot'
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
    setSelectedSlotId(slot.id)
  }

  const updateSelectedSlot = (updates) => {
    setSlots((prevSlots) =>
      prevSlots.map((s) => (s.id === selectedSlotId ? { ...s, ...updates } : s))
    )
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
          <span className="app-header__subtitle">Core Slot Components</span>
        </div>
      </header>

      <main className="app-main">
        <section className="slot-grid-panel">
          <div className="panel-header">
            <h2>Parking Slots</h2>
            <span className="panel-hint">Click a slot to select it or edit its state</span>
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

        {selectedSlot && (
          <aside className="inspector-panel">
            <div className="panel-header">
              <h2>Slot Inspector</h2>
              <span className="panel-hint">{selectedSlot.id}</span>
            </div>

            <div className="form-group">
              <label htmlFor="slot-label">Label</label>
              <input
                id="slot-label"
                type="text"
                className="form-input"
                value={selectedSlot.label}
                onChange={(e) => updateSelectedSlot({ label: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="slot-vehicle">Vehicle Type</label>
              <select
                id="slot-vehicle"
                className="form-select"
                value={selectedSlot.vehicleType}
                onChange={(e) => updateSelectedSlot({ vehicleType: e.target.value })}
              >
                <option value="car">Car</option>
                <option value="ev">EV</option>
                <option value="bike">Motorcycle / Bike</option>
                <option value="truck">Truck / Cargo</option>
                <option value="accessible">Accessible</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="slot-status">Status</label>
              <select
                id="slot-status"
                className="form-select"
                value={selectedSlot.status}
                onChange={(e) => updateSelectedSlot({ status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="slot-section">Section</label>
              <input
                id="slot-section"
                type="text"
                className="form-input"
                value={selectedSlot.section || ''}
                onChange={(e) => updateSelectedSlot({ section: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="slot-rotation">Rotation ({selectedSlot.rotation || 0}°)</label>
              <input
                id="slot-rotation"
                type="range"
                min="0"
                max="360"
                step="15"
                className="form-range"
                value={selectedSlot.rotation || 0}
                onChange={(e) => updateSelectedSlot({ rotation: Number(e.target.value) })}
              />
            </div>
          </aside>
        )}
      </main>
    </div>
  )
}

export default App
