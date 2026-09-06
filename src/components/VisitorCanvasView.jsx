import { useEffect, useRef, useState } from 'react'
import { ParkingSlot } from './ParkingSlot'
import { OBJECT_TYPES, isSlotType, DEFAULT_CANVAS_CONFIG } from '../utils/layoutModels'
import './VisitorCanvasView.css'

function renderStructuralElement(obj) {
  switch (obj.type) {
    case OBJECT_TYPES.ROAD:
      return (
        <div className="visitor-canvas-road">
          <span>{obj.label}</span>
        </div>
      )
    case OBJECT_TYPES.WALL:
      return <div className="visitor-canvas-wall" />
    case OBJECT_TYPES.PILLAR:
      return (
        <div className="visitor-canvas-pillar">
          <span>{obj.label || 'P'}</span>
        </div>
      )
    case OBJECT_TYPES.ENTRY:
    case OBJECT_TYPES.EXIT:
      return (
        <div className={`visitor-canvas-gate visitor-canvas-gate--${obj.type}`}>
          <span>{obj.label || obj.type.toUpperCase()}</span>
        </div>
      )
    default:
      return null
  }
}

export function VisitorCanvasView({
  objects = [],
  selectedSlotId = null,
  onSelectSlot,
  unavailableSlotIds = new Set(),
  hasActiveWindow = false,
  canvasWidth = DEFAULT_CANVAS_CONFIG.width,
  canvasHeight = DEFAULT_CANVAS_CONFIG.height,
}) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      const availableWidth = container.clientWidth
      const nextScale = Math.min(1, availableWidth / canvasWidth)
      setScale(nextScale > 0 ? nextScale : 1)
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(container)
    return () => observer.disconnect()
  }, [canvasWidth])

  return (
    <div className="visitor-canvas-container" ref={containerRef}>
      <div
        className="visitor-canvas-scaler"
        style={{ height: `${canvasHeight * scale}px` }}
      >
        <div
          className="visitor-canvas-surface"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {objects.map((obj) => {
            const isSlot = isSlotType(obj.type)
            const isSelected = obj.id === selectedSlotId
            const isUnavailable = hasActiveWindow && unavailableSlotIds.has(obj.id)
            const style = {
              position: 'absolute',
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              width: `${obj.width}px`,
              height: `${obj.height}px`,
              transform: obj.rotation && !isSlot ? `rotate(${obj.rotation}deg)` : undefined,
              transformOrigin: 'center center',
            }

            return (
              <div key={obj.id} className="visitor-canvas-object" style={style}>
                {isSlot ? (
                  <ParkingSlot
                    id={obj.id}
                    label={obj.label}
                    vehicleType={obj.vehicleType}
                    status={isSelected ? 'selected' : isUnavailable ? 'occupied' : 'available'}
                    rotation={obj.rotation}
                    width={obj.width}
                    height={obj.height}
                    section={obj.section}
                    onClick={() => {
                      if (isUnavailable) return
                      onSelectSlot && onSelectSlot(obj)
                    }}
                  />
                ) : (
                  renderStructuralElement(obj)
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
