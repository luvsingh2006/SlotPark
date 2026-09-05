import {
  PointerIcon,
  EraserIcon,
  CarIcon,
  EvIcon,
  AccessibleIcon,
  BikeIcon,
  TruckIcon,
  RoadIcon,
  WallIcon,
  PillarIcon,
  SnapIcon,
  BlueprintIcon,
} from './Icons'
import { OBJECT_TYPES } from '../utils/layoutModels'
import './DesignerToolbar.css'

export const TOOLS = [
  // Primary Pointer Tools
  { id: 'select', label: 'Select / Move', icon: PointerIcon, category: 'mode' },
  { id: 'eraser', label: 'Eraser', icon: EraserIcon, category: 'mode' },

  // Parking Spaces
  { id: OBJECT_TYPES.PARKING, label: 'Car Slot', icon: CarIcon, category: 'slots' },
  { id: OBJECT_TYPES.EV, label: 'EV Station', icon: EvIcon, category: 'slots' },
  { id: OBJECT_TYPES.ACCESSIBLE, label: 'Accessible', icon: AccessibleIcon, category: 'slots' },
  { id: OBJECT_TYPES.BIKE, label: 'Bike Slot', icon: BikeIcon, category: 'slots' },
  { id: OBJECT_TYPES.TRUCK, label: 'Truck / Cargo', icon: TruckIcon, category: 'slots' },

  // Structural Elements
  { id: OBJECT_TYPES.ROAD, label: 'Driving Lane', icon: RoadIcon, category: 'structures' },
  { id: OBJECT_TYPES.WALL, label: 'Perimeter Wall', icon: WallIcon, category: 'structures' },
  { id: OBJECT_TYPES.PILLAR, label: 'Pillar', icon: PillarIcon, category: 'structures' },
]

export function DesignerToolbar({
  activeTool = 'select',
  onSelectTool,
  totalSlots = 0,
  snapToGrid = true,
  onToggleSnap,
  gridSize = 20,
  blueprintActive = false,
  onToggleBlueprint,
}) {
  return (
    <div className="designer-toolbar" role="toolbar" aria-label="Layout designer tools">
      <div className="designer-toolbar__group">
        <span className="toolbar-group__label">Pointer</span>
        {TOOLS.filter((t) => t.category === 'mode').map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          return (
            <button
              key={tool.id}
              type="button"
              className={`tool-btn ${isActive ? 'tool-btn--active' : ''}`}
              onClick={() => onSelectTool(tool.id)}
              title={`${tool.label} ${tool.id === 'select' ? '(V)' : tool.id === 'eraser' ? '(E)' : ''}`}
            >
              <Icon size={16} />
              <span className="tool-btn__text">{tool.label}</span>
            </button>
          )
        })}
      </div>

      <div className="designer-toolbar__divider" />

      <div className="designer-toolbar__group">
        <span className="toolbar-group__label">Parking Spaces</span>
        {TOOLS.filter((t) => t.category === 'slots').map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          return (
            <button
              key={tool.id}
              type="button"
              className={`tool-btn ${isActive ? 'tool-btn--active' : ''}`}
              onClick={() => onSelectTool(tool.id)}
              title={`Place ${tool.label}`}
            >
              <Icon size={16} />
              <span className="tool-btn__text">{tool.label}</span>
            </button>
          )
        })}
      </div>

      <div className="designer-toolbar__divider" />

      <div className="designer-toolbar__group">
        <span className="toolbar-group__label">Structures</span>
        {TOOLS.filter((t) => t.category === 'structures').map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          return (
            <button
              key={tool.id}
              type="button"
              className={`tool-btn ${isActive ? 'tool-btn--active' : ''}`}
              onClick={() => onSelectTool(tool.id)}
              title={`Place ${tool.label}`}
            >
              <Icon size={16} />
              <span className="tool-btn__text">{tool.label}</span>
            </button>
          )
        })}
      </div>

      <div className="designer-toolbar__divider" />

      <div className="designer-toolbar__group">
        <button
          type="button"
          className={`tool-btn ${snapToGrid ? 'tool-btn--snap-active' : ''}`}
          onClick={onToggleSnap}
          title="Toggle Grid Snapping (G)"
        >
          <SnapIcon size={16} />
          <span className="tool-btn__text">Snap ({gridSize}px)</span>
        </button>
        {onToggleBlueprint && (
          <button
            type="button"
            className={`tool-btn ${blueprintActive ? 'tool-btn--active' : ''}`}
            onClick={onToggleBlueprint}
            title="Blueprint Overlay Settings (B)"
          >
            <BlueprintIcon size={16} />
            <span className="tool-btn__text">Blueprint</span>
          </button>
        )}
      </div>

      <div className="designer-toolbar__stats">
        <span className="stats-badge">Slots: {totalSlots}</span>
      </div>
    </div>
  )
}
