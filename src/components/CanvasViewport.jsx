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
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFitView, zoom, pan])

  // Mouse down on canvas background -> begin panning
  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return
    if (e.target.closest('.canvas-object') || e.target.closest('.canvas-viewport__controls')) return

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
    if (e.target.closest('.canvas-object') || e.target.closest('.canvas-viewport__controls')) return
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
      </div>
    </div>
  )
}
