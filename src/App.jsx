import { useState, useEffect } from 'react'
import { CanvasViewport } from './components/CanvasViewport'
import { DesignerToolbar } from './components/DesignerToolbar'
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
  const [activeTool, setActiveTool] = useState('select')
  const [transform, setTransform] = useState({ zoom: 1, pan: { x: 40, y: 40 } })

  const selectedObject = objects.find((obj) => obj.id === selectedId) || null
  const isSelectedSlot = selectedObject && isSlotType(selectedObject.type)
  const totalSlots = objects.filter((o) => isSlotType(o.type)).length

  // Quick keyboard tool switching (V = Select, E = Eraser)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key.toLowerCase() === 'v') {
        setActiveTool('select')
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('eraser')
      } else if (e.key === 'Escape') {
        setActiveTool('select')
        setSelectedId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelectObject = (id) => {
    if (activeTool === 'eraser') {
      handleDeleteObject(id)
      return
    }
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const handleCanvasClick = () => {
    if (activeTool === 'select') {
      setSelectedId(null)
    }
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
    const slotCount = totalSlots + 1
    const newSlot = createLayoutObject(OBJECT_TYPES.PARKING, 120 + slotCount * 20, 260, {
      label: `A-${String(slotCount).padStart(2, '0')}`,
    })
    setObjects((prev) => [...prev, newSlot])
    setSelectedId(newSlot.id)
    setActiveTool('select')
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

      <DesignerToolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        totalSlots={totalSlots}
      />

      <main className="app-main">
        <section className="designer-canvas-section">
          <div className="panel-header">
            <div>
              <h2>Parking Floor Plan</h2>
              <span className="panel-hint">
                {activeTool === 'select'
                  ? 'Drag canvas to pan • Scroll to zoom • Click object to inspect'
                  : activeTool === 'eraser'
                  ? 'Click any element to erase it'
                  : `Active tool: ${activeTool}. Placement logic coming next.`}
              </span>
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
            activeTool={activeTool}
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
                  ? `Structural element (${selectedObject.type}).`
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
