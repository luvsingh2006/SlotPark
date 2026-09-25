import { useState, useEffect, useCallback, useMemo } from 'react'
import { CanvasViewport } from './components/CanvasViewport'
import { DesignerToolbar } from './components/DesignerToolbar'
import { SlotInspector } from './components/SlotInspector'
import { ParkingStatsBar } from './components/ParkingStatsBar'
import { ExportModal } from './components/ExportModal'
import { ImportModal } from './components/ImportModal'
import { ModeSwitcher } from './components/ModeSwitcher'
import { VisitorCanvasView } from './components/VisitorCanvasView'
import { TimeRangePicker } from './components/TimeRangePicker'
import { CapacitySummaryPill } from './components/CapacitySummaryPill'
import { VehicleTypeFilterBar } from './components/VehicleTypeFilterBar'
import { useToast, ToastViewport } from './components/Toast'
import { BookingModal } from './components/BookingModal'
import { ParkingPassCard } from './components/ParkingPassCard'
import { ActiveBookingsDrawer } from './components/ActiveBookingsDrawer'
import { getUnavailableSlotIds, generateBookingReference, BOOKING_STATUS } from './utils/bookingHelpers'
import { useLocalStorageSync } from './hooks/useLocalStorageSync'
import { TemplateSelector } from './components/TemplateSelector'
import { ConfirmDialog } from './components/ConfirmDialog'
import { getTemplateById } from './utils/layoutTemplates'
import { DownloadIcon, UploadIcon, UserIcon, LogOutIcon } from './components/Icons'
import AuthModal from './components/AuthModal'
import { getCurrentSession, logoutUser, initializeDemoOwnerIfEmpty } from './utils/cryptoAuth'
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
  const [currentUser, setCurrentUser] = useState(() => getCurrentSession())
  const [mode, setMode] = useState(() => (getCurrentSession() ? 'admin' : 'visitor'))
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const [objects, setObjects] = useLocalStorageSync('parkslot_layout', INITIAL_LAYOUT_OBJECTS)
  const [selectedId, setSelectedId] = useState('slot-a01')
  const [activeTool, setActiveTool] = useState('select')
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridMode, setGridMode] = useState('dots')
  const [statsFilter, setStatsFilter] = useState(null)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [transform, setTransform] = useState({ zoom: 1, pan: { x: 40, y: 40 } })
  const [blueprint, setBlueprint] = useState({
    url: null,
    name: null,
    opacity: 0.4,
    visible: true,
  })
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false)
  const [selectedVisitorSlotId, setSelectedVisitorSlotId] = useState(null)
  const [bookingWindow, setBookingWindow] = useState(null)
  const [bookings, setBookings] = useLocalStorageSync('parkslot_bookings', [])
  const [visitorTypeFilter, setVisitorTypeFilter] = useState(null)
  const { toasts, showToast } = useToast()
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false)

  useEffect(() => {
    initializeDemoOwnerIfEmpty()
  }, [])

  const handleModeChange = (newMode) => {
    if (newMode === 'admin' && !currentUser) {
      setAuthModalMode('login')
      setIsAuthModalOpen(true)
      showToast('Please sign in as the parking lot owner to enter Designer Mode.', 'info')
      return
    }
    setMode(newMode)
  }

  const handleLogout = () => {
    logoutUser()
    setCurrentUser(null)
    setMode('visitor')
    showToast('Signed out of lot owner session.', 'info')
  }

  const handleAuthSuccess = (user) => {
    setCurrentUser(user)
    setMode('admin')
    showToast(`Signed in as ${user.fullName} (${user.lotName}).`, 'success')
  }

  const unavailableSlotIds = useMemo(() => {
    if (!bookingWindow) return new Set()
    const slotIds = objects.filter((o) => isSlotType(o.type)).map((o) => o.id)
    return getUnavailableSlotIds(slotIds, bookingWindow.startTime, bookingWindow.endTime, bookings)
  }, [objects, bookingWindow, bookings])

  const selectedVisitorSlot = objects.find((o) => o.id === selectedVisitorSlotId) || null

  const handleConfirmBooking = ({ slotId, driverName, vehiclePlate, startTime, endTime }) => {
    const newBooking = {
      id: `booking-${Date.now()}`,
      reference: generateBookingReference(),
      slotId,
      driverName,
      vehiclePlate,
      startTime,
      endTime,
      status: BOOKING_STATUS.ACTIVE,
    }
    setBookings((prev) => [...prev, newBooking])
    setIsBookingModalOpen(false)
    setConfirmedBooking(newBooking)
  }

  const handleCancelBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: BOOKING_STATUS.CANCELLED } : b))
    )
    showToast('Reservation cancelled — the slot is free again.', 'success')
  }

  const handleLoadTemplate = (templateId) => {
    const template = getTemplateById(templateId)
    if (!template) return
    setObjects(template.objects)
    setSelectedId(null)
    showToast(`Loaded "${template.name}" template.`, 'success')
  }

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  const handleResetLayout = () => {
    setObjects(INITIAL_LAYOUT_OBJECTS)
    setSelectedId(null)
    setIsResetConfirmOpen(false)
    showToast('Layout reset to default.', 'success')
  }

  const handleImportLayout = useCallback((importedData, mode = 'replace') => {
    if (!importedData || !importedData.objects) return
    if (mode === 'replace') {
      setObjects(importedData.objects)
      if (importedData.objects.length > 0) {
        setSelectedId(importedData.objects[0].id)
      } else {
        setSelectedId(null)
      }
    } else {
      setObjects((prev) => {
        const existingIds = new Set(prev.map((o) => o.id))
        const sanitizedNew = importedData.objects.map((obj) => {
          if (existingIds.has(obj.id)) {
            return { ...obj, id: `${obj.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}` }
          }
          return obj
        })
        return [...prev, ...sanitizedNew]
      })
    }
  }, [])

  const handleUpdateBlueprint = useCallback((updates) => {
    setBlueprint((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleToggleBlueprint = useCallback(() => {
    setIsBlueprintOpen((prev) => !prev)
  }, [])

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
  const selectedIndex = objects.findIndex((obj) => obj.id === selectedId)
  const layerInfo =
    selectedIndex !== -1
      ? {
          index: selectedIndex + 1,
          total: objects.length,
          isTop: selectedIndex === objects.length - 1,
          isBottom: selectedIndex === 0,
        }
      : null

  // Quick keyboard tool switching (V = Select, E = Eraser)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key.toLowerCase() === 'v') {
        setActiveTool('select')
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('eraser')
      } else if (e.key.toLowerCase() === 'b') {
        setIsBlueprintOpen((prev) => !prev)
      } else if (e.key.toLowerCase() === 'g') {
        setSnapToGrid((prev) => !prev)
      } else if (e.key === 'Escape') {
        setIsImportOpen((prevImport) => {
          if (prevImport) return false
          setIsExportOpen((prevExport) => {
            if (prevExport) return false
            setStatsFilter((prevFilter) => {
              if (prevFilter) return null
              setActiveTool('select')
              setSelectedId(null)
              return null
            })
            return false
          })
          return false
        })
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        handleDeleteObject(selectedId)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault()
        handleDuplicateObject(selectedId)
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedId) {
        e.preventDefault()
        const step = e.shiftKey ? DEFAULT_GRID_SIZE : (snapToGrid ? 5 : 1)
        let dx = 0
        let dy = 0
        if (e.key === 'ArrowLeft') dx = -step
        if (e.key === 'ArrowRight') dx = step
        if (e.key === 'ArrowUp') dy = -step
        if (e.key === 'ArrowDown') dy = step
        handleNudgeObject(selectedId, dx, dy)
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '[' || e.key === ']') && selectedId) {
        e.preventDefault()
        if (e.key === ']') {
          handleReorderObject(selectedId, e.shiftKey ? 'front' : 'forward')
        } else {
          handleReorderObject(selectedId, e.shiftKey ? 'back' : 'backward')
        }
      } else if ((e.key === '[' || e.key === ']') && selectedId) {
        e.preventDefault()
        const angleStep = e.shiftKey ? 45 : 15
        const deltaAngle = e.key === '[' ? -angleStep : angleStep
        handleRotateObjectStep(selectedId, deltaAngle)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, objects, snapToGrid])

  const handleSelectObject = (id) => {
    if (activeTool === 'eraser') {
      handleDeleteObject(id)
      return
    }
    setSelectedId(id)
  }

  const handleCanvasClick = () => {
    if (activeTool === 'select') {
      setSelectedId(null)
    }
  }

  const handleUpdateObject = useCallback((id, updates) => {
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
        const finalObj = { ...merged, x: clamped.x, y: clamped.y }
        let isDifferent = false
        for (const key of Object.keys(finalObj)) {
          if (finalObj[key] !== obj[key]) {
            isDifferent = true
            break
          }
        }
        return isDifferent ? finalObj : obj
      })
    )
  }, [])

  const handleNudgeObject = (id, dx, dy) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj
        const targetX = obj.x + dx
        const targetY = obj.y + dy
        const clamped = clampToBounds(
          targetX,
          targetY,
          obj.width,
          obj.height,
          DEFAULT_CANVAS_CONFIG.width,
          DEFAULT_CANVAS_CONFIG.height
        )
        return { ...obj, x: clamped.x, y: clamped.y }
      })
    )
  }

  const handleRotateObjectStep = (id, deltaAngle) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj
        const currentRot = obj.rotation || 0
        const newRot = (currentRot + deltaAngle % 360 + 360) % 360
        return { ...obj, rotation: newRot }
      })
    )
  }

  const handleReorderObject = useCallback((id, direction) => {
    setObjects((prev) => {
      const index = prev.findIndex((obj) => obj.id === id)
      if (index === -1) return prev

      const newObjects = [...prev]
      const [item] = newObjects.splice(index, 1)

      if (direction === 'front') {
        newObjects.push(item)
      } else if (direction === 'back') {
        newObjects.unshift(item)
      } else if (direction === 'forward') {
        const targetIndex = Math.min(index + 1, newObjects.length)
        newObjects.splice(targetIndex, 0, item)
      } else if (direction === 'backward') {
        const targetIndex = Math.max(index - 1, 0)
        newObjects.splice(targetIndex, 0, item)
      }

      return newObjects
    })
  }, [])

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
          <span className="app-header__subtitle">
            {currentUser?.lotName ? `${currentUser.lotName} • Spatial Designer` : 'Spatial Layout Designer'}
          </span>
        </div>
        <div className="app-header__actions">
          {currentUser ? (
            <div className="user-profile-chip" title={`Logged in as ${currentUser.email}`}>
              <span className="user-profile-chip__badge">Owner</span>
              <span className="user-profile-chip__name">{currentUser.fullName}</span>
              <button
                type="button"
                className="user-profile-chip__logout-btn"
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOutIcon size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn--subtle"
              onClick={() => {
                setAuthModalMode('login')
                setIsAuthModalOpen(true)
              }}
              title="Sign in as Parking Lot Owner"
            >
              <UserIcon size={14} />
              <span>Owner Login</span>
            </button>
          )}

          <ModeSwitcher mode={mode} onChange={handleModeChange} />
          {mode === 'admin' && (
            <>
              <TemplateSelector onSelectTemplate={handleLoadTemplate} />
              <button
                type="button"
                className="btn btn--subtle"
                onClick={() => setIsResetConfirmOpen(true)}
                title="Reset to Default Layout"
              >
                Reset Layout
              </button>
              <button
                type="button"
                className="btn btn--subtle"
                onClick={() => setIsImportOpen(true)}
                title="Import Layout from JSON"
              >
                <UploadIcon size={14} />
                <span>Import</span>
              </button>
              <button
                type="button"
                className="btn btn--subtle"
                onClick={() => setIsExportOpen(true)}
                title="Export Layout as JSON"
              >
                <DownloadIcon size={14} />
                <span>Export</span>
              </button>
              <button type="button" className="btn btn--primary" onClick={handleAddSlot}>
                Add Slot
              </button>
            </>
          )}
          {mode === 'visitor' && (
            <button type="button" className="btn btn--subtle" onClick={() => setIsBookingsDrawerOpen(true)}>
              My Bookings ({bookings.filter((b) => b.status === BOOKING_STATUS.ACTIVE).length})
            </button>
          )}
        </div>
      </header>

      {mode === 'admin' ? (
        <div key="admin" className="mode-fade-in-wrapper">
          <DesignerToolbar
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            totalSlots={totalSlots}
            snapToGrid={snapToGrid}
            onToggleSnap={() => setSnapToGrid((prev) => !prev)}
            gridSize={DEFAULT_GRID_SIZE}
            blueprintActive={Boolean(blueprint.url && blueprint.visible)}
            onToggleBlueprint={handleToggleBlueprint}
          />

          <ParkingStatsBar
            objects={objects}
            activeFilter={statsFilter}
            onSelectFilter={setStatsFilter}
          />

          <main className="app-main">
            <section className="designer-canvas-section">
              <div className="panel-header">
                <div>
                  <h2>Parking Floor Plan</h2>
                  <span className="panel-hint">
                    {activeTool === 'select'
                      ? 'Drag or Arrow keys to nudge • Shift+Arrow 20px • Drag canvas to pan • Scroll to zoom'
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
                blueprint={blueprint}
                onUpdateBlueprint={handleUpdateBlueprint}
                isBlueprintOpen={isBlueprintOpen}
                onToggleBlueprint={handleToggleBlueprint}
                statsFilter={statsFilter}
              />
            </section>

            <SlotInspector
              slot={selectedObject}
              onUpdate={handleUpdateSelectedSlot}
              onDeselect={() => setSelectedId(null)}
              onDelete={handleDeleteObject}
              onDuplicate={handleDuplicateObject}
              onReorder={handleReorderObject}
              layerInfo={layerInfo}
            />
          </main>

          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            objects={objects}
            blueprint={blueprint}
          />

          <ImportModal
            isOpen={isImportOpen}
            onClose={() => setIsImportOpen(false)}
            onImportLayout={handleImportLayout}
            canvasBounds={{ width: DEFAULT_CANVAS_CONFIG.width, height: DEFAULT_CANVAS_CONFIG.height }}
          />
        </div>
      ) : (
        <main key="visitor" className="app-main app-main--single mode-fade-in">
          <section className="designer-canvas-section">
            <div className="panel-header">
              <div>
                <h2>Parking Floor Plan</h2>
                <span className="panel-hint">Select an available slot to reserve it</span>
              </div>
            </div>

            <TimeRangePicker onChange={setBookingWindow} />

            <CapacitySummaryPill
              objects={objects}
              unavailableSlotIds={unavailableSlotIds}
              hasActiveWindow={Boolean(bookingWindow)}
            />

            <VehicleTypeFilterBar activeType={visitorTypeFilter} onChange={setVisitorTypeFilter} />

            <VisitorCanvasView
              objects={objects}
              selectedSlotId={selectedVisitorSlotId}
              onSelectSlot={(slot) => {
                setSelectedVisitorSlotId(slot.id)
                setIsBookingModalOpen(true)
              }}
              onSelectUnavailableSlot={(slot) =>
                showToast(`Slot ${slot.label || slot.id} is already booked for this time window.`)
              }
              unavailableSlotIds={unavailableSlotIds}
              hasActiveWindow={Boolean(bookingWindow)}
              highlightType={visitorTypeFilter}
              canvasWidth={DEFAULT_CANVAS_CONFIG.width}
              canvasHeight={DEFAULT_CANVAS_CONFIG.height}
            />
          </section>
        </main>
      )}

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        slot={selectedVisitorSlot}
        bookingWindow={bookingWindow}
        onConfirm={handleConfirmBooking}
      />

      {confirmedBooking && (
        <div className="modal-backdrop" onClick={() => setConfirmedBooking(null)}>
          <div
            className="modal-card"
            role="dialog"
            aria-label="Booking Confirmed"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-card__header">
              <div className="modal-card__title">
                <h3>Booking Confirmed</h3>
              </div>
              <button
                type="button"
                className="modal-card__close"
                onClick={() => setConfirmedBooking(null)}
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-card__body">
              <ParkingPassCard
                booking={confirmedBooking}
                slotLabel={objects.find((o) => o.id === confirmedBooking.slotId)?.label || confirmedBooking.slotId}
              />
            </div>
            <div className="modal-card__footer">
              <button type="button" className="btn btn--primary" onClick={() => setConfirmedBooking(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <ActiveBookingsDrawer
        isOpen={isBookingsDrawerOpen}
        onClose={() => setIsBookingsDrawerOpen(false)}
        bookings={bookings}
        objects={objects}
        onCancelBooking={handleCancelBooking}
      />

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Layout to Default?"
        message="This will discard your current parking lot design and restore the original starting layout. This cannot be undone."
        confirmLabel="Reset Layout"
        onConfirm={handleResetLayout}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        currentLotName={currentUser?.lotName || 'Downtown Express Garage'}
      />

      <ToastViewport toasts={toasts} />
    </div>
  )
}

export default App
