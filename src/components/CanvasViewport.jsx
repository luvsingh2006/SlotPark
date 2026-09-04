import { useState, useRef, useEffect, useCallback } from 'react'
import { ParkingSlot } from './ParkingSlot'
import {
  OBJECT_TYPES,
  isSlotType,
  DEFAULT_CANVAS_CONFIG,
  DEFAULT_DIMENSIONS,
} from '../utils/layoutModels'
import {
  snapPointToGrid,
  snapToGrid,
  clampToBounds,
  snapAngle,
  DEFAULT_GRID_SIZE,
} from '../utils/gridUtils'
import './CanvasViewport.css'

export function CanvasViewport({
  objects = [],
  selectedObjectId = null,
  onSelectObject,
  onUpdateObject,
  onCanvasClick,
  onPlaceObject,
  canvasWidth = DEFAULT_CANVAS_CONFIG.width,
  canvasHeight = DEFAULT_CANVAS_CONFIG.height,
  zoom = 1,
  pan = { x: 40, y: 40 },
  onTransformChange,
  activeTool = 'select',
  snapToGrid = true,
  gridSize = DEFAULT_GRID_SIZE,
  showGrid = true,
  gridStyle = 'dots',
  onToggleGrid,
}) {
  const containerRef = useRef(null)
  const isPanningRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0 })

  const isDraggingObjectRef = useRef(false)
  const dragObjectRef = useRef({
    id: null,
    startMouseX: 0,
    startMouseY: 0,
    startObjX: 0,
    startObjY: 0,
    hasMoved: false,
  })

  const isRotatingRef = useRef(false)
  const rotateTargetRef = useRef({
    id: null,
    centerX: 0,
    centerY: 0,
  })

  const [isPanningState, setIsPanningState] = useState(false)
  const [draggingObjectId, setDraggingObjectId] = useState(null)
  const [isRotatingState, setIsRotatingState] = useState(false)
  const [rotatingAngle, setRotatingAngle] = useState(null)
  const [cursorCanvasPos, setCursorCanvasPos] = useState(null)

  const isPlacing = activeTool !== 'select' && activeTool !== 'eraser'
  const activeToolDimensions = isPlacing ? DEFAULT_DIMENSIONS[activeTool] || { width: 80, height: 120 } : null

  // Zoom towards viewport center or target position
  const setZoomLevel = useCallback(
    (targetZoom) => {
      if (!onTransformChange) return
      const clampedZoom = Math.min(
        DEFAULT_CANVAS_CONFIG.maxZoom,
        Math.max(DEFAULT_CANVAS_CONFIG.minZoom, Number(targetZoom.toFixed(2)))
      )
      if (clampedZoom === zoom) return

      const rect = containerRef.current?.getBoundingClientRect()
      const centerX = rect ? rect.width / 2 : 400
      const centerY = rect ? rect.height / 2 : 300

      const scaleRatio = clampedZoom / zoom
      const newPanX = Math.round(centerX - (centerX - pan.x) * scaleRatio)
      const newPanY = Math.round(centerY - (centerY - pan.y) * scaleRatio)

      onTransformChange({
        zoom: clampedZoom,
        pan: { x: newPanX, y: newPanY },
      })
    },
    [zoom, pan, onTransformChange]
  )

  const handleZoomIn = () => setZoomLevel(zoom + 0.15)
  const handleZoomOut = () => setZoomLevel(zoom - 0.15)

  const handleResetView = () => {
    if (onTransformChange) {
      onTransformChange({
        zoom: 1,
        pan: { x: 40, y: 40 },
      })
    }
  }

  const handleFitView = useCallback(() => {
    if (!onTransformChange || objects.length === 0) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    objects.forEach((obj) => {
      minX = Math.min(minX, obj.x)
      minY = Math.min(minY, obj.y)
      maxX = Math.max(maxX, obj.x + obj.width)
      maxY = Math.max(maxY, obj.y + obj.height)
    })

    const padding = 60
    const contentWidth = Math.max(maxX - minX + padding * 2, 200)
    const contentHeight = Math.max(maxY - minY + padding * 2, 200)

    const scaleX = rect.width / contentWidth
    const scaleY = rect.height / contentHeight
    const targetZoom = Math.min(
      DEFAULT_CANVAS_CONFIG.maxZoom,
      Math.max(DEFAULT_CANVAS_CONFIG.minZoom, Number(Math.min(scaleX, scaleY).toFixed(2)))
    )

    const contentCenterX = (minX + maxX) / 2
    const contentCenterY = (minY + maxY) / 2

    const newPanX = Math.round(rect.width / 2 - contentCenterX * targetZoom)
    const newPanY = Math.round(rect.height / 2 - contentCenterY * targetZoom)

    onTransformChange({
      zoom: targetZoom,
      pan: { x: newPanX, y: newPanY },
    })
  }, [objects, onTransformChange])

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault()
      if (!onTransformChange) return

      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
      const newZoom = Math.min(
        DEFAULT_CANVAS_CONFIG.maxZoom,
        Math.max(DEFAULT_CANVAS_CONFIG.minZoom, Number((zoom * zoomFactor).toFixed(2)))
      )

      if (newZoom === zoom) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const scaleRatio = newZoom / zoom
      const newPanX = Math.round(mouseX - (mouseX - pan.x) * scaleRatio)
      const newPanY = Math.round(mouseY - (mouseY - pan.y) * scaleRatio)

      onTransformChange({
        zoom: newZoom,
        pan: { x: newPanX, y: newPanY },
      })
    },
    [zoom, pan, onTransformChange]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Keyboard navigation shortcuts (+, -, 0, f)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return

      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        handleZoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        handleResetView()
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault()
        handleFitView()
      } else if (e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        if (onToggleGrid) onToggleGrid()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFitView, zoom, pan])

  // Initiate dragging an object on the canvas
  const handleObjectMouseDown = (e, obj) => {
    if (e.button !== 0) return
    if (activeTool !== 'select') return

    e.stopPropagation()
    if (onSelectObject) onSelectObject(obj.id)

    isDraggingObjectRef.current = true
    dragObjectRef.current = {
      id: obj.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startObjX: obj.x,
      startObjY: obj.y,
      hasMoved: false,
    }
    setDraggingObjectId(obj.id)
  }

  // Initiate rotating an object on the canvas
  const handleRotateMouseDown = (e, obj) => {
    if (e.button !== 0) return
    e.stopPropagation()

    isRotatingRef.current = true
    rotateTargetRef.current = {
      id: obj.id,
      centerX: obj.x + obj.width / 2,
      centerY: obj.y + obj.height / 2,
    }
    setIsRotatingState(true)
    setRotatingAngle(obj.rotation || 0)
  }

  const handleGlobalMouseMove = useCallback(
    (e) => {
      // Rotation angle calculation
      if (isRotatingRef.current && onUpdateObject) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoom
        const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoom

        const { id, centerX, centerY } = rotateTargetRef.current
        const dx = mouseCanvasX - centerX
        const dy = mouseCanvasY - centerY

        const rad = Math.atan2(dy, dx)
        let deg = Math.round(rad * (180 / Math.PI) + 90)
        deg = (deg % 360 + 360) % 360

        // Snap to 15-degree steps if snapToGrid is enabled or Shift is held
        const finalAngle = (snapToGrid || e.shiftKey) ? snapAngle(deg, 15) : deg

        setRotatingAngle(finalAngle)
        onUpdateObject(id, { rotation: finalAngle })
        return
      }

      if (!isDraggingObjectRef.current || !onUpdateObject) return

      const { id, startMouseX, startMouseY, startObjX, startObjY } = dragObjectRef.current
      const deltaScreenX = e.clientX - startMouseX
      const deltaScreenY = e.clientY - startMouseY

      if (Math.abs(deltaScreenX) > 2 || Math.abs(deltaScreenY) > 2) {
        dragObjectRef.current.hasMoved = true
      }

      const deltaCanvasX = deltaScreenX / zoom
      const deltaCanvasY = deltaScreenY / zoom

      let targetX = startObjX + deltaCanvasX
      let targetY = startObjY + deltaCanvasY

      if (snapToGrid) {
        targetX = snapToGrid(targetX, gridSize)
        targetY = snapToGrid(targetY, gridSize)
      } else {
        targetX = Math.round(targetX)
        targetY = Math.round(targetY)
      }

      const currentObj = objects.find((o) => o.id === id)
      const objWidth = currentObj?.width || 80
      const objHeight = currentObj?.height || 120
      const clamped = clampToBounds(targetX, targetY, objWidth, objHeight, canvasWidth, canvasHeight)

      onUpdateObject(id, { x: clamped.x, y: clamped.y })
    },
    [zoom, snapToGrid, gridSize, onUpdateObject, objects, canvasWidth, canvasHeight, pan]
  )

  const handleGlobalMouseUp = useCallback(() => {
    if (isRotatingRef.current) {
      isRotatingRef.current = false
      setIsRotatingState(false)
      setRotatingAngle(null)
    }
    if (isDraggingObjectRef.current) {
      isDraggingObjectRef.current = false
      setDraggingObjectId(null)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [handleGlobalMouseMove, handleGlobalMouseUp])

  // Mouse down on canvas background -> begin panning if not placing an object
  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return
    if (e.target.closest('.canvas-viewport__controls')) return

    // If activeTool is a placement tool, do not initiate pan on left-click
    if (isPlacing && e.button === 0) return

    if (e.target.closest('.canvas-object')) return

    isPanningRef.current = true
    setIsPanningState(true)
    panStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    }
  }

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect && isPlacing) {
      const rawCanvasX = (e.clientX - rect.left - pan.x) / zoom
      const rawCanvasY = (e.clientY - rect.top - pan.y) / zoom
      const targetPos = snapToGrid
        ? snapPointToGrid(rawCanvasX, rawCanvasY, gridSize)
        : { x: Math.round(rawCanvasX), y: Math.round(rawCanvasY) }
      setCursorCanvasPos(targetPos)
    }

    if (!isPanningRef.current || !onTransformChange) return

    const nextPan = {
      x: Math.round(e.clientX - panStartRef.current.x),
      y: Math.round(e.clientY - panStartRef.current.y),
    }

    onTransformChange({
      zoom,
      pan: nextPan,
    })
  }

  const handleMouseUp = () => {
    isPanningRef.current = false
    setIsPanningState(false)
  }

  const handleMouseLeave = () => {
    isPanningRef.current = false
    setIsPanningState(false)
    setCursorCanvasPos(null)
  }

  const handleCanvasSurfaceClick = (e) => {
    if (e.target.closest('.canvas-viewport__controls')) return

    if (isPlacing && onPlaceObject && cursorCanvasPos) {
      const dim = activeToolDimensions || { width: 80, height: 120 }
      const rawX = cursorCanvasPos.x - dim.width / 2
      const rawY = cursorCanvasPos.y - dim.height / 2
      const clamped = clampToBounds(rawX, rawY, dim.width, dim.height, canvasWidth, canvasHeight)
      onPlaceObject(activeTool, clamped.x + dim.width / 2, clamped.y + dim.height / 2)
      return
    }

    if (e.target.closest('.canvas-object')) return
    if (onCanvasClick) {
      onCanvasClick(e)
    }
  }

  const renderStructuralElement = (obj, isSelected) => {
    switch (obj.type) {
      case OBJECT_TYPES.ROAD:
        return (
          <div className={`canvas-road ${isSelected ? 'canvas-object--selected' : ''}`}>
            <span className="canvas-road__label">{obj.label}</span>
          </div>
        )
      case OBJECT_TYPES.WALL:
        return <div className={`canvas-wall ${isSelected ? 'canvas-object--selected' : ''}`} />
      case OBJECT_TYPES.PILLAR:
        return (
          <div className={`canvas-pillar ${isSelected ? 'canvas-object--selected' : ''}`}>
            <span>{obj.label || 'P'}</span>
          </div>
        )
      case OBJECT_TYPES.ENTRY:
      case OBJECT_TYPES.EXIT:
        return (
          <div
            className={`canvas-gate canvas-gate--${obj.type} ${isSelected ? 'canvas-object--selected' : ''}`}
          >
            <span>{obj.label || obj.type.toUpperCase()}</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={containerRef}
      className={`canvas-viewport ${isPanningState ? 'canvas-viewport--panning' : ''} ${isRotatingState ? 'canvas-viewport--rotating' : ''} canvas-viewport--${activeTool}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleCanvasSurfaceClick}
    >
      <div
        className={`canvas-surface ${showGrid ? `canvas-surface--grid-${gridStyle}` : ''}`}
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <div className="canvas-surface__boundary-tag" aria-hidden="true">
          {canvasWidth} × {canvasHeight} px
        </div>
        {objects.map((obj) => {
          const isSelected = obj.id === selectedObjectId
          const isSlot = isSlotType(obj.type)

          const objectStyle = {
            position: 'absolute',
            left: `${obj.x}px`,
            top: `${obj.y}px`,
            width: `${obj.width}px`,
            height: `${obj.height}px`,
            transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
            transformOrigin: 'center center',
          }

          const isDragging = obj.id === draggingObjectId

          return (
            <div
              key={obj.id}
              className={`canvas-object ${isSelected ? 'canvas-object--selected' : ''} ${isDragging ? 'canvas-object--dragging' : ''} ${activeTool === 'select' ? 'canvas-object--draggable' : ''}`}
              style={objectStyle}
              onMouseDown={(e) => handleObjectMouseDown(e, obj)}
              onClick={(e) => {
                e.stopPropagation()
                if (dragObjectRef.current.hasMoved) return
                if (onSelectObject) onSelectObject(obj.id)
              }}
            >
              {isSlot ? (
                <ParkingSlot
                  id={obj.id}
                  label={obj.label}
                  vehicleType={obj.vehicleType}
                  status={isSelected ? 'selected' : obj.status || 'available'}
                  width={obj.width}
                  height={obj.height}
                  section={obj.section}
                />
              ) : (
                renderStructuralElement(obj, isSelected)
              )}

              {isSelected && (
                <div className="canvas-selection-box">
                  <span className="canvas-selection-handle canvas-selection-handle--nw" />
                  <span className="canvas-selection-handle canvas-selection-handle--ne" />
                  <span className="canvas-selection-handle canvas-selection-handle--se" />
                  <span className="canvas-selection-handle canvas-selection-handle--sw" />
                  <div className="canvas-selection-rotate-anchor">
                    <span className="canvas-selection-rotate-stem" />
                    <span
                      className="canvas-selection-rotate-handle"
                      onMouseDown={(e) => handleRotateMouseDown(e, obj)}
                      title="Drag to Rotate (Hold Shift to snap 15°)"
                    />
                    {isRotatingState && rotateTargetRef.current.id === obj.id && (
                      <div className="canvas-selection-rotate-tooltip">
                        {rotatingAngle ?? obj.rotation ?? 0}°
                      </div>
                    )}
                  </div>
                  <div className="canvas-selection-badge">
                    <span className="canvas-selection-badge__title">{obj.label || obj.type}</span>
                    <span className="canvas-selection-badge__dim">{obj.width}×{obj.height}</span>
                    {obj.rotation ? (
                      <span className="canvas-selection-badge__rot">{obj.rotation}°</span>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Ghost Placement Preview */}
        {isPlacing && cursorCanvasPos && activeToolDimensions && (
          <div
            className="canvas-ghost-preview"
            style={{
              position: 'absolute',
              left: `${cursorCanvasPos.x - activeToolDimensions.width / 2}px`,
              top: `${cursorCanvasPos.y - activeToolDimensions.height / 2}px`,
              width: `${activeToolDimensions.width}px`,
              height: `${activeToolDimensions.height}px`,
            }}
          >
            <span className="canvas-ghost-preview__label">{activeTool}</span>
          </div>
        )}
      </div>

      {/* Viewport Floating Action Controls */}
      <div className="canvas-viewport__controls">
        <button
          type="button"
          className="canvas-control-btn"
          onClick={handleZoomIn}
          title="Zoom In (+)"
        >
          +
        </button>
        <span className="canvas-control-level">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          className="canvas-control-btn"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
        >
          −
        </button>
        <div className="canvas-control-divider" />
        <button
          type="button"
          className="canvas-control-btn canvas-control-btn--text"
          onClick={handleResetView}
          title="Reset View 100% (0)"
        >
          1:1
        </button>
        <button
          type="button"
          className="canvas-control-btn canvas-control-btn--text"
          onClick={handleFitView}
          title="Fit Objects to Viewport (F)"
        >
          Fit
        </button>
        <button
          type="button"
          className={`canvas-control-btn canvas-control-btn--text ${showGrid ? 'canvas-control-btn--active' : ''}`}
          onClick={onToggleGrid}
          title={`Grid Pattern: ${showGrid ? gridStyle : 'hidden'} (Shift+G)`}
        >
          Grid
        </button>
      </div>
    </div>
  )
}
