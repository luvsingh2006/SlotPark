export const OBJECT_TYPES = {
  PARKING: 'parking',
  EV: 'ev',
  BIKE: 'bike',
  TRUCK: 'truck',
  ACCESSIBLE: 'accessible',
  ROAD: 'road',
  WALL: 'wall',
  PILLAR: 'pillar',
  ENTRY: 'entry',
  EXIT: 'exit',
}

export const DEFAULT_DIMENSIONS = {
  [OBJECT_TYPES.PARKING]: { width: 80, height: 130 },
  [OBJECT_TYPES.EV]: { width: 80, height: 130 },
  [OBJECT_TYPES.ACCESSIBLE]: { width: 90, height: 130 },
  [OBJECT_TYPES.BIKE]: { width: 50, height: 80 },
  [OBJECT_TYPES.TRUCK]: { width: 100, height: 180 },
  [OBJECT_TYPES.ROAD]: { width: 240, height: 80 },
  [OBJECT_TYPES.WALL]: { width: 160, height: 16 },
  [OBJECT_TYPES.PILLAR]: { width: 36, height: 36 },
  [OBJECT_TYPES.ENTRY]: { width: 90, height: 40 },
  [OBJECT_TYPES.EXIT]: { width: 90, height: 40 },
}

export const DEFAULT_CANVAS_CONFIG = {
  width: 1600,
  height: 1000,
  gridSize: 20,
  minZoom: 0.4,
  maxZoom: 2.5,
}

export function isSlotType(type) {
  return [
    OBJECT_TYPES.PARKING,
    OBJECT_TYPES.EV,
    OBJECT_TYPES.BIKE,
    OBJECT_TYPES.TRUCK,
    OBJECT_TYPES.ACCESSIBLE,
  ].includes(type)
}

export function getVehicleTypeFromObjectType(type) {
  switch (type) {
    case OBJECT_TYPES.EV:
      return 'ev'
    case OBJECT_TYPES.BIKE:
      return 'bike'
    case OBJECT_TYPES.TRUCK:
      return 'truck'
    case OBJECT_TYPES.ACCESSIBLE:
      return 'accessible'
    case OBJECT_TYPES.PARKING:
    default:
      return 'car'
  }
}

let objectCounter = 10

export function createLayoutObject(type, x, y, customProps = {}) {
  const dimensions = DEFAULT_DIMENSIONS[type] || { width: 80, height: 120 }
  const isSlot = isSlotType(type)
  const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  let label = customProps.label
  if (!label && isSlot) {
    label = `S-${String(objectCounter++).padStart(2, '0')}`
  }

  return {
    id,
    type,
    x: Math.round(x),
    y: Math.round(y),
    width: dimensions.width,
    height: dimensions.height,
    rotation: 0,
    label: label || '',
    section: customProps.section || (isSlot ? 'Main Lot' : ''),
    vehicleType: isSlot ? getVehicleTypeFromObjectType(type) : undefined,
    status: isSlot ? 'available' : undefined,
    ...customProps,
  }
}

export const INITIAL_LAYOUT_OBJECTS = [
  // Driving lane / road in the middle
  {
    id: 'road-1',
    type: OBJECT_TYPES.ROAD,
    x: 100,
    y: 280,
    width: 680,
    height: 90,
    rotation: 0,
    label: 'Main Driving Lane',
  },
  // Top row parking slots (Zone A)
  {
    id: 'slot-a01',
    type: OBJECT_TYPES.PARKING,
    x: 120,
    y: 120,
    width: 80,
    height: 130,
    rotation: 0,
    label: 'A-01',
    section: 'Zone A',
    vehicleType: 'car',
    status: 'available',
  },
  {
    id: 'slot-a02',
    type: OBJECT_TYPES.PARKING,
    x: 230,
    y: 120,
    width: 80,
    height: 130,
    rotation: 0,
    label: 'A-02',
    section: 'Zone A',
    vehicleType: 'car',
    status: 'occupied',
  },
  {
    id: 'slot-ev01',
    type: OBJECT_TYPES.EV,
    x: 340,
    y: 120,
    width: 80,
    height: 130,
    rotation: 0,
    label: 'EV-01',
    section: 'Zone A',
    vehicleType: 'ev',
    status: 'available',
  },
  {
    id: 'slot-acc01',
    type: OBJECT_TYPES.ACCESSIBLE,
    x: 450,
    y: 120,
    width: 90,
    height: 130,
    rotation: 0,
    label: 'ACC-01',
    section: 'Zone A',
    vehicleType: 'accessible',
    status: 'available',
  },
  // Bottom row parking slots (Zone B) - 45 degree angled parking
  {
    id: 'slot-b01',
    type: OBJECT_TYPES.BIKE,
    x: 130,
    y: 430,
    width: 50,
    height: 80,
    rotation: 45,
    label: 'B-01',
    section: 'Zone B',
    vehicleType: 'bike',
    status: 'available',
  },
  {
    id: 'slot-b02',
    type: OBJECT_TYPES.BIKE,
    x: 230,
    y: 430,
    width: 50,
    height: 80,
    rotation: 45,
    label: 'B-02',
    section: 'Zone B',
    vehicleType: 'bike',
    status: 'reserved',
  },
  {
    id: 'slot-t01',
    type: OBJECT_TYPES.TRUCK,
    x: 350,
    y: 420,
    width: 100,
    height: 180,
    rotation: 0,
    label: 'T-01',
    section: 'Cargo',
    vehicleType: 'truck',
    status: 'available',
  },
  // Boundary wall & Pillar
  {
    id: 'wall-1',
    type: OBJECT_TYPES.WALL,
    x: 100,
    y: 80,
    width: 680,
    height: 16,
    rotation: 0,
    label: 'North Wall',
  },
  {
    id: 'pillar-1',
    type: OBJECT_TYPES.PILLAR,
    x: 580,
    y: 160,
    width: 36,
    height: 36,
    rotation: 0,
    label: 'P-1',
  },
]
