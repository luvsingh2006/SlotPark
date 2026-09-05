import {
  isSlotType,
  getVehicleTypeFromObjectType,
  DEFAULT_CANVAS_CONFIG,
} from './layoutModels'

/**
 * Serializes the current spatial layout into a standardized CAD-compatible JSON structure.
 *
 * @param {Array} objects - The layout objects array
 * @param {Object} options - Configuration options (name, author, canvasWidth, canvasHeight, blueprint, etc.)
 * @returns {Object} Standardized layout JSON payload
 */
export function serializeLayout(objects = [], options = {}) {
  const slots = objects.filter((o) => isSlotType(o.type))
  const totalSlots = slots.length

  // Vehicle category breakdown
  const vehicleBreakdown = {
    car: 0,
    ev: 0,
    accessible: 0,
    bike: 0,
    truck: 0,
  }

  // Status breakdown
  const statusBreakdown = {
    available: 0,
    occupied: 0,
    reserved: 0,
    disabled: 0,
  }

  slots.forEach((s) => {
    const vType = s.vehicleType || getVehicleTypeFromObjectType(s.type)
    if (vehicleBreakdown[vType] !== undefined) {
      vehicleBreakdown[vType]++
    }
    const status = s.status || 'available'
    if (statusBreakdown[status] !== undefined) {
      statusBreakdown[status]++
    }
  })

  // Sanitize objects to retain only clean spatial and semantic properties
  const sanitizedObjects = objects.map((obj) => {
    const base = {
      id: obj.id,
      type: obj.type,
      x: Math.round(obj.x),
      y: Math.round(obj.y),
      width: Math.round(obj.width),
      height: Math.round(obj.height),
      rotation: obj.rotation || 0,
    }

    if (obj.label) base.label = obj.label
    if (obj.section) base.section = obj.section

    if (isSlotType(obj.type)) {
      base.vehicleType = obj.vehicleType || getVehicleTypeFromObjectType(obj.type)
      base.status = obj.status || 'available'
    }

    return base
  })

  return {
    version: '1.0.0',
    generator: 'SlotPark Spatial Layout Designer',
    timestamp: new Date().toISOString(),
    metadata: {
      name: options.name?.trim() || 'Parking Floor Plan',
      author: options.author?.trim() || 'SlotPark Architect',
      units: 'px',
      scale: '1px = 0.5ft',
    },
    canvas: {
      width: options.canvasWidth || DEFAULT_CANVAS_CONFIG.width,
      height: options.canvasHeight || DEFAULT_CANVAS_CONFIG.height,
      gridSize: options.gridSize || DEFAULT_CANVAS_CONFIG.gridSize,
    },
    blueprint: options.blueprint?.name
      ? {
          name: options.blueprint.name,
          opacity: options.blueprint.opacity,
          visible: options.blueprint.visible,
        }
      : null,
    summary: {
      totalObjects: objects.length,
      totalSlots,
      structuralElements: objects.length - totalSlots,
      vehicleBreakdown,
      statusBreakdown,
    },
    objects: sanitizedObjects,
  }
}

/**
 * Generates an indented JSON string representation of the layout.
 */
export function exportLayoutToJSON(objects, options = {}) {
  const data = serializeLayout(objects, options)
  return JSON.stringify(data, null, 2)
}

/**
 * Triggers browser download of the layout as a .json file.
 *
 * @param {Array} objects - The layout objects array
 * @param {Object} options - Export options including project name and author
 * @returns {Object} Result summary with filename and payload size
 */
export function downloadLayoutFile(objects, options = {}) {
  const jsonString = exportLayoutToJSON(objects, options)
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })

  const rawName = options.name?.trim() || 'slotpark-layout'
  const cleanName = rawName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')
  const dateTag = new Date().toISOString().slice(0, 10)
  const filename = `${cleanName}-${dateTag}.json`

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return {
    success: true,
    filename,
    size: jsonString.length,
  }
}
