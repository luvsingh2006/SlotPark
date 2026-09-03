import { useState, useRef, useEffect, useCallback } from 'react'
import { ParkingSlot } from './ParkingSlot'
import { OBJECT_TYPES, isSlotType, DEFAULT_CANVAS_CONFIG } from '../utils/layoutModels'
import './CanvasViewport.css'

export function CanvasViewport({
  objects = [],
  selectedObjectId = null,
  onSelectObject,
  onCanvasClick,
  canvasWidth = DEFAULT_CANVAS_CONFIG.width,
  canvasHeight = DEFAULT_CANVAS_CONFIG.height,
  zoom = 1,
  pan = { x: 40, y: 40 },
  onTransformChange,
}) {
  const containerRef = useRef(null)
  const isPanningRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0 })

  const [isPanningState, setIsPanningState] = useState(false)

  // Wheel zoom handler
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

      // Zoom towards mouse position
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

  // Mouse down on canvas background -> begin panning
  const handleMouseDown = (e) => {
    // Only primary mouse button or middle click initiates pan
    if (e.button !== 0 && e.button !== 1) return

    // Don't pan if clicking an interactive object
    if (e.target.closest('.canvas-object')) return

    isPanningRef.current = true
    setIsPanningState(true)
    panStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    }
  }

  const handleMouseMove = (e) => {
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

  const handleCanvasSurfaceClick = (e) => {
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
      className={`canvas-viewport ${isPanningState ? 'canvas-viewport--panning' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasSurfaceClick}
    >
      <div
        className="canvas-surface"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
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

          return (
            <div
              key={obj.id}
              className={`canvas-object ${isSelected ? 'canvas-object--selected' : ''}`}
              style={objectStyle}
              onClick={(e) => {
                e.stopPropagation()
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
            </div>
          )
        })}
      </div>

      <div className="canvas-viewport__indicator">
        <span>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  )
}
