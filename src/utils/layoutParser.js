import {
  OBJECT_TYPES,
  isSlotType,
  getVehicleTypeFromObjectType,
  DEFAULT_CANVAS_CONFIG,
  DEFAULT_DIMENSIONS,
} from './layoutModels'
import { clampToBounds } from './gridUtils'

const VALID_OBJECT_TYPES = new Set(Object.values(OBJECT_TYPES))
const VALID_VEHICLE_TYPES = new Set(['car', 'ev', 'bike', 'truck', 'accessible'])
const VALID_STATUSES = new Set(['available', 'occupied', 'reserved', 'disabled'])

/**
 * Validates and parses a JSON string or object into a sanitized SlotPark layout schema.
 *
 * @param {string|Object} rawInput - The input JSON string or parsed object
 * @param {Object} canvasBounds - Canvas width & height for boundary clamping
 * @returns {Object} Parse result: { success, data, summary, error }
 */
export function parseAndValidateLayout(rawInput, canvasBounds = DEFAULT_CANVAS_CONFIG) {
  const warnings = []

  let parsed = rawInput
  if (typeof rawInput === 'string') {
    try {
      parsed = JSON.parse(rawInput)
    } catch (e) {
      return {
        success: false,
        error: `Invalid JSON syntax: ${e.message}`,
        warnings: [],
      }
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      success: false,
      error: 'Invalid file content: Root payload must be a JSON object or array.',
      warnings: [],
    }
  }

  let rawObjects = null
  let metadata = {}
  let blueprint = null
  const canvas = { ...DEFAULT_CANVAS_CONFIG, ...canvasBounds }

  if (Array.isArray(parsed)) {
    rawObjects = parsed
    warnings.push('Legacy array format detected. Automatically upgraded to schema v1.0.')
  } else if (Array.isArray(parsed.objects)) {
    rawObjects = parsed.objects
    metadata = parsed.metadata || {}
    blueprint = parsed.blueprint || null
    if (parsed.canvas) {
      canvas.width = Number(parsed.canvas.width) || canvas.width
      canvas.height = Number(parsed.canvas.height) || canvas.height
      canvas.gridSize = Number(parsed.canvas.gridSize) || canvas.gridSize
    }
  } else {
    return {
      success: false,
      error: 'Unrecognized schema: Missing required "objects" array.',
      warnings: [],
    }
  }

  if (rawObjects.length === 0) {
    return {
      success: false,
      error: 'Empty layout: The provided file contains no layout objects.',
      warnings: [],
    }
  }

  const sanitizedObjects = []
  const existingIds = new Set()
  let slotsCount = 0
  let structuresCount = 0

  for (let i = 0; i < rawObjects.length; i++) {
    const item = rawObjects[i]
    if (!item || typeof item !== 'object') {
      warnings.push(`Item at index ${i} is not an object. Skipped.`)
      continue
    }

    // Type validation & fallback
    let itemType = typeof item.type === 'string' ? item.type.toLowerCase().trim() : ''
    if (!VALID_OBJECT_TYPES.has(itemType)) {
      if (item.vehicleType || item.status) {
        warnings.push(`Object ${item.id || i}: Unknown type "${item.type}". Assigned default "parking".`)
        itemType = OBJECT_TYPES.PARKING
      } else {
        warnings.push(`Object ${item.id || i}: Unknown element type "${item.type}". Skipped.`)
        continue
      }
    }

    // ID validation & deduplication
    let id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `${itemType}-${Date.now()}-${i}`
    if (existingIds.has(id)) {
      const uniqueId = `${id}-${Math.floor(Math.random() * 1000)}`
      warnings.push(`Duplicate ID "${id}" detected. Renamed to "${uniqueId}".`)
      id = uniqueId
    }
    existingIds.add(id)

    // Dimensions
    const defaultDim = DEFAULT_DIMENSIONS[itemType] || { width: 80, height: 120 }
    const width = typeof item.width === 'number' && item.width > 0 ? Math.round(item.width) : defaultDim.width
    const height = typeof item.height === 'number' && item.height > 0 ? Math.round(item.height) : defaultDim.height

    // Position & clamping
    const rawX = typeof item.x === 'number' ? Math.round(item.x) : 100
    const rawY = typeof item.y === 'number' ? Math.round(item.y) : 100
    const clamped = clampToBounds(rawX, rawY, width, height, canvas.width, canvas.height)

    // Rotation
    let rotation = typeof item.rotation === 'number' ? Math.round(item.rotation) : 0
    rotation = ((rotation % 360) + 360) % 360

    const obj = {
      id,
      type: itemType,
      x: clamped.x,
      y: clamped.y,
      width,
      height,
      rotation,
      label: typeof item.label === 'string' ? item.label.trim() : '',
    }

    if (item.section && typeof item.section === 'string') {
      obj.section = item.section.trim()
    }

    if (isSlotType(itemType)) {
      slotsCount++
      let vType = typeof item.vehicleType === 'string' ? item.vehicleType.toLowerCase().trim() : getVehicleTypeFromObjectType(itemType)
      if (!VALID_VEHICLE_TYPES.has(vType)) {
        vType = getVehicleTypeFromObjectType(itemType)
      }
      obj.vehicleType = vType

      let status = typeof item.status === 'string' ? item.status.toLowerCase().trim() : 'available'
      if (!VALID_STATUSES.has(status)) {
        status = 'available'
      }
      obj.status = status
    } else {
      structuresCount++
    }

    sanitizedObjects.push(obj)
  }

  if (sanitizedObjects.length === 0) {
    return {
      success: false,
      error: 'No valid objects could be parsed from the layout file.',
      warnings,
    }
  }

  return {
    success: true,
    data: {
      objects: sanitizedObjects,
      metadata: {
        name: metadata.name || 'Imported Floor Plan',
        author: metadata.author || 'Unknown',
        units: metadata.units || 'px',
        scale: metadata.scale || '1px = 0.5ft',
      },
      canvas,
      blueprint,
    },
    summary: {
      totalParsed: sanitizedObjects.length,
      slotsCount,
      structuresCount,
      warnings,
    },
    error: null,
  }
}
