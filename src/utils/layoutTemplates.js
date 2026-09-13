import { OBJECT_TYPES } from './layoutModels'

/**
 * Preset parking lot layouts an admin can load as a starting point instead
 * of building from a blank canvas. Each template is a full array of
 * LayoutObjects, same shape as INITIAL_LAYOUT_OBJECTS.
 */

function slot(id, x, y, label, section, vehicleType = 'car', overrides = {}) {
  const dims = vehicleType === 'bike' ? { width: 50, height: 90 } : { width: 80, height: 130 }
  return {
    id,
    type: vehicleType === 'car' ? OBJECT_TYPES.PARKING : OBJECT_TYPES[vehicleType.toUpperCase()],
    x,
    y,
    ...dims,
    rotation: 0,
    label,
    section,
    vehicleType,
    status: 'available',
    ...overrides,
  }
}

const SCHOOL_CAMPUS_TEMPLATE = [
  { id: 'sc-entry', type: OBJECT_TYPES.ENTRY, x: 60, y: 440, width: 90, height: 60, rotation: 0, label: 'Main Gate' },
  { id: 'sc-exit', type: OBJECT_TYPES.EXIT, x: 1450, y: 440, width: 90, height: 60, rotation: 0, label: 'Exit Gate' },
  { id: 'sc-road', type: OBJECT_TYPES.ROAD, x: 160, y: 420, width: 1280, height: 100, rotation: 0, label: 'Campus Drive' },
  slot('sc-a01', 200, 200, 'F-01', 'Faculty Row', 'car'),
  slot('sc-a02', 300, 200, 'F-02', 'Faculty Row', 'car'),
  slot('sc-a03', 400, 200, 'F-03', 'Faculty Row', 'car'),
  slot('sc-a04', 500, 200, 'EV-01', 'Faculty Row', 'ev'),
  slot('sc-a05', 600, 200, 'ACC-01', 'Faculty Row', 'accessible'),
  slot('sc-b01', 200, 580, 'S-01', 'Student Row', 'bike'),
  slot('sc-b02', 270, 580, 'S-02', 'Student Row', 'bike'),
  slot('sc-b03', 340, 580, 'S-03', 'Student Row', 'bike'),
  slot('sc-b04', 410, 580, 'S-04', 'Student Row', 'bike'),
  slot('sc-b05', 800, 200, 'V-01', 'Visitor Row', 'car'),
  slot('sc-b06', 900, 200, 'V-02', 'Visitor Row', 'car'),
  { id: 'sc-pillar-1', type: OBJECT_TYPES.PILLAR, x: 700, y: 400, width: 40, height: 40, rotation: 0, label: 'P1' },
]

const OFFICE_TEMPLATE = [
  { id: 'of-entry', type: OBJECT_TYPES.ENTRY, x: 60, y: 460, width: 90, height: 60, rotation: 0, label: 'Entry' },
  { id: 'of-exit', type: OBJECT_TYPES.EXIT, x: 1450, y: 460, width: 90, height: 60, rotation: 0, label: 'Exit' },
  { id: 'of-road', type: OBJECT_TYPES.ROAD, x: 160, y: 440, width: 1280, height: 100, rotation: 0, label: 'Access Lane' },
  slot('of-a01', 200, 220, 'A-01', 'Zone A', 'car'),
  slot('of-a02', 300, 220, 'A-02', 'Zone A', 'car'),
  slot('of-a03', 400, 220, 'A-03', 'Zone A', 'car'),
  slot('of-a04', 500, 220, 'A-04', 'Zone A', 'car'),
  slot('of-a05', 600, 220, 'EV-01', 'Zone A', 'ev'),
  slot('of-a06', 700, 220, 'EV-02', 'Zone A', 'ev'),
  slot('of-a07', 800, 220, 'ACC-01', 'Zone A', 'accessible'),
  slot('of-b01', 200, 640, 'B-01', 'Zone B', 'car'),
  slot('of-b02', 300, 640, 'B-02', 'Zone B', 'car'),
  slot('of-b03', 400, 640, 'B-03', 'Zone B', 'car'),
  slot('of-b04', 500, 640, 'BK-01', 'Zone B', 'bike'),
  slot('of-b05', 570, 640, 'BK-02', 'Zone B', 'bike'),
  { id: 'of-wall-1', type: OBJECT_TYPES.WALL, x: 950, y: 200, width: 20, height: 500, rotation: 0, label: 'Building Wall' },
]

const MALL_TEMPLATE = [
  { id: 'ml-entry', type: OBJECT_TYPES.ENTRY, x: 60, y: 480, width: 90, height: 60, rotation: 0, label: 'Entry Ramp' },
  { id: 'ml-exit', type: OBJECT_TYPES.EXIT, x: 1450, y: 480, width: 90, height: 60, rotation: 0, label: 'Exit Ramp' },
  { id: 'ml-road-1', type: OBJECT_TYPES.ROAD, x: 160, y: 460, width: 1280, height: 90, rotation: 0, label: 'Level 1 Lane' },
  { id: 'ml-road-2', type: OBJECT_TYPES.ROAD, x: 160, y: 140, width: 1280, height: 70, rotation: 0, label: 'Level 1 Lane North' },
  slot('ml-a01', 200, 230, 'M-01', 'North Wing', 'car'),
  slot('ml-a02', 300, 230, 'M-02', 'North Wing', 'car'),
  slot('ml-a03', 400, 230, 'M-03', 'North Wing', 'car'),
  slot('ml-a04', 500, 230, 'M-04', 'North Wing', 'car'),
  slot('ml-a05', 600, 230, 'EV-01', 'North Wing', 'ev'),
  slot('ml-a06', 700, 230, 'EV-02', 'North Wing', 'ev'),
  slot('ml-a07', 800, 230, 'ACC-01', 'North Wing', 'accessible'),
  slot('ml-a08', 900, 230, 'ACC-02', 'North Wing', 'accessible'),
  slot('ml-b01', 200, 640, 'S-01', 'South Wing', 'car'),
  slot('ml-b02', 300, 640, 'S-02', 'South Wing', 'car'),
  slot('ml-b03', 400, 640, 'S-03', 'South Wing', 'car'),
  slot('ml-b04', 500, 640, 'S-04', 'South Wing', 'car'),
  slot('ml-b05', 600, 640, 'T-01', 'South Wing', 'truck'),
  slot('ml-b06', 720, 640, 'BK-01', 'South Wing', 'bike'),
  slot('ml-b07', 790, 640, 'BK-02', 'South Wing', 'bike'),
  { id: 'ml-pillar-1', type: OBJECT_TYPES.PILLAR, x: 1050, y: 350, width: 40, height: 40, rotation: 0, label: 'P1' },
  { id: 'ml-pillar-2', type: OBJECT_TYPES.PILLAR, x: 1050, y: 550, width: 40, height: 40, rotation: 0, label: 'P2' },
]

export const LAYOUT_TEMPLATES = [
  { id: 'school-campus', name: 'School Campus', description: 'Faculty, student and visitor zones', objects: SCHOOL_CAMPUS_TEMPLATE },
  { id: 'office', name: 'Office', description: 'Two zones with EV and accessible bays', objects: OFFICE_TEMPLATE },
  { id: 'mall', name: 'Mall', description: 'North/South wings with mixed vehicle types', objects: MALL_TEMPLATE },
]

export function getTemplateById(templateId) {
  return LAYOUT_TEMPLATES.find((t) => t.id === templateId) || null
}
