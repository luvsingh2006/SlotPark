import { useState } from 'react'
import { CanvasViewport } from './components/CanvasViewport'
import { SlotInspector } from './components/SlotInspector'
import {
  INITIAL_LAYOUT_OBJECTS,
  OBJECT_TYPES,
  createLayoutObject,
  isSlotType,
} from './utils/layoutModels'
import './App.css'

function App() {
  const [objects, setObjects] = useState(INITIAL_LAYOUT_OBJECTS)
  const [selectedId, setSelectedId] = useState('slot-a01')
  const [transform, setTransform] = useState({ zoom: 1, pan: { x: 40, y: 40 } })

  const selectedObject = objects.find((obj) => obj.id === selectedId) || null
  const isSelectedSlot = selectedObject && isSlotType(selectedObject.type)

  const handleSelectObject = (id) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const handleCanvasClick = () => {
    setSelectedId(null)
  }

  const handleUpdateSelectedSlot = (updates) => {
    setObjects((prev) =>
      prev.map((obj) => (obj.id === selectedId ? { ...obj, ...updates } : obj))
    )
  }

  const handleDeleteObject = (id) => {
    setObjects((prev) => prev.filter((obj) => obj.id !== id))
    if (selectedId === id) {
      setSelectedId(null)
    }
  }

  const handleAddSlot = () => {
    const slotCount = objects.filter((o) => isSlotType(o.type)).length + 1
    const newSlot = createLayoutObject(OBJECT_TYPES.PARKING, 120 + slotCount * 20, 260, {
      label: `A-${String(slotCount).padStart(2, '0')}`,
    })
    setObjects((prev) => [...prev, newSlot])
    setSelectedId(newSlot.id)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__title">
          <h1>SlotPark</h1>
          <span className="app-header__subtitle">Spatial Layout Designer</span>
        </div>
        <div className="app-header__actions">
          <button type="button" className="btn btn--primary" onClick={handleAddSlot}>
            Add Slot
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="designer-canvas-section">
          <div className="panel-header">
            <div>
              <h2>Parking Floor Plan</h2>
              <span className="panel-hint">Drag canvas to pan • Scroll to zoom • Click object to select</span>
            </div>
          </div>

          <CanvasViewport
            objects={objects}
            selectedObjectId={selectedId}
            onSelectObject={handleSelectObject}
            onCanvasClick={handleCanvasClick}
            zoom={transform.zoom}
            pan={transform.pan}
            onTransformChange={setTransform}
          />
        </section>

        {isSelectedSlot ? (
          <SlotInspector
            slot={selectedObject}
            onUpdate={handleUpdateSelectedSlot}
            onDeselect={() => setSelectedId(null)}
            onDelete={handleDeleteObject}
          />
        ) : (
          <aside className="slot-inspector slot-inspector--empty">
            <div className="slot-inspector__placeholder">
              <h3>{selectedObject ? selectedObject.label || selectedObject.type : 'No Object Selected'}</h3>
              <p>
                {selectedObject
                  ? `Structural element (${selectedObject.type}). Spatial property controls coming next.`
                  : 'Select any parking space or structural element on the canvas to inspect its properties.'}
              </p>
            </div>
          </aside>
        )}
      </main>
    </div>
  )
}

export default App
