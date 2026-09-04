import { useState, useEffect } from 'react'
import { CanvasViewport } from './components/CanvasViewport'
import { DesignerToolbar } from './components/DesignerToolbar'
import { SlotInspector } from './components/SlotInspector'
import {
  INITIAL_LAYOUT_OBJECTS,
  OBJECT_TYPES,
  DEFAULT_CANVAS_CONFIG,
  DEFAULT_DIMENSIONS,
  createLayoutObject,
  isSlotType,
  getPlacedObjectPosition,
  generateNextLabel,
} from './utils/layoutModels'
import { snapPointToGrid, clampToBounds, DEFAULT_GRID_SIZE } from './utils/gridUtils'
import './App.css'

function App() {
  const [objects, setObjects] = useState(INITIAL_LAYOUT_OBJECTS)
  const [selectedId, setSelectedId] = useState('slot-a01')
  const [activeTool, setActiveTool] = useState('select')
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridMode, setGridMode] = useState('dots')
  const [transform, setTransform] = useState({ zoom: 1, pan: { x: 40, y: 40 } })

  const handleToggleGrid = () => {
    setGridMode((prev) => {
      if (prev === 'dots') return 'lines'
      if (prev === 'lines') return 'off'
      return 'dots'
    })
  }

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
      } else if (e.key.toLowerCase() === 'g') {
        setSnapToGrid((prev) => !prev)
      } else if (e.key === 'Escape') {
        setActiveTool('select')
        setSelectedId(null)
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        handleDeleteObject(selectedId)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault()
        handleDuplicateObject(selectedId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, objects])

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

  const handleUpdateObject = (id, updates) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj
        const merged = { ...obj, ...updates }
        const clamped = clampToBounds(
          merged.x,
          merged.y,
          merged.width,
          merged.height,
          DEFAULT_CANVAS_CONFIG.width,
          DEFAULT_CANVAS_CONFIG.height
        )
        return { ...merged, x: clamped.x, y: clamped.y }
      })
    )
  }

  const handleUpdateSelectedSlot = (updates) => {
    if (selectedId) {
      handleUpdateObject(selectedId, updates)
    }
  }

  const handleDeleteObject = (id) => {
    setObjects((prev) => prev.filter((obj) => obj.id !== id))
    if (selectedId === id) {
      setSelectedId(null)
    }
  }

  const handleDuplicateObject = (id) => {
    const target = objects.find((o) => o.id === id)
    if (!target) return
    const newId = `${target.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const nextPos = clampToBounds(
      target.x + 20,
      target.y + 20,
      target.width,
      target.height,
      DEFAULT_CANVAS_CONFIG.width,
      DEFAULT_CANVAS_CONFIG.height
    )
    const duplicated = {
      ...target,
      id: newId,
      x: nextPos.x,
      y: nextPos.y,
      label: target.label ? `${target.label} (Copy)` : '',
    }
    setObjects((prev) => [...prev, duplicated])
    setSelectedId(newId)
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

  const handlePlaceObject = (toolType, clickX, clickY) => {
    const rawPos = getPlacedObjectPosition(toolType, clickX, clickY)
    const pos = snapToGrid ? snapPointToGrid(rawPos.x, rawPos.y, DEFAULT_GRID_SIZE) : rawPos
    const dim = DEFAULT_DIMENSIONS[toolType] || { width: 80, height: 120 }
    const clamped = clampToBounds(
      pos.x,
      pos.y,
      dim.width,
      dim.height,
      DEFAULT_CANVAS_CONFIG.width,
      DEFAULT_CANVAS_CONFIG.height
    )
    const label = generateNextLabel(toolType, objects)
    const newObj = createLayoutObject(toolType, clamped.x, clamped.y, { label })
    setObjects((prev) => [...prev, newObj])
    setSelectedId(newObj.id)
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
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid((prev) => !prev)}
        gridSize={DEFAULT_GRID_SIZE}
      />

      <main className="app-main">
        <section className="designer-canvas-section">
          <div className="panel-header">
            <div>
              <h2>Parking Floor Plan</h2>
              <span className="panel-hint">
                {activeTool === 'select'
                  ? 'Drag objects to reposition • Drag canvas to pan • Scroll to zoom'
                  : activeTool === 'eraser'
                  ? 'Click any element to remove it'
                  : `Click canvas to place ${activeTool} (Esc to cancel)`}
              </span>
            </div>
          </div>

          <CanvasViewport
            objects={objects}
            selectedObjectId={selectedId}
            onSelectObject={handleSelectObject}
            onUpdateObject={handleUpdateObject}
            onCanvasClick={handleCanvasClick}
            onPlaceObject={handlePlaceObject}
            zoom={transform.zoom}
            pan={transform.pan}
            onTransformChange={setTransform}
            activeTool={activeTool}
            snapToGrid={snapToGrid}
            gridSize={DEFAULT_GRID_SIZE}
            showGrid={gridMode !== 'off'}
            gridStyle={gridMode === 'lines' ? 'lines' : 'dots'}
            onToggleGrid={handleToggleGrid}
          />
        </section>

        <SlotInspector
          slot={selectedObject}
          onUpdate={handleUpdateSelectedSlot}
          onDeselect={() => setSelectedId(null)}
          onDelete={handleDeleteObject}
          onDuplicate={handleDuplicateObject}
        />
      </main>
    </div>
  )
}

export default App
