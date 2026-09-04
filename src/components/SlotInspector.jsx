import { isSlotType } from '../utils/layoutModels'
import './SlotInspector.css'

const VEHICLE_OPTIONS = [
  { value: 'car', label: 'Car' },
  { value: 'ev', label: 'Electric Vehicle (EV)' },
  { value: 'bike', label: 'Motorcycle / Bike' },
  { value: 'truck', label: 'Truck / Cargo' },
  { value: 'accessible', label: 'Accessible' },
]

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'disabled', label: 'Disabled' },
]

const PRESET_ROTATIONS = [0, 45, 90, 180]

export function SlotInspector({
  slot: obj,
  onUpdate,
  onDeselect,
  onDelete,
  onDuplicate,
}) {
  if (!obj) {
    return (
      <aside className="slot-inspector slot-inspector--empty">
        <div className="slot-inspector__placeholder">
          <h3>No Object Selected</h3>
          <p>Click on any parking slot or structural element on the canvas to inspect its attributes.</p>
        </div>
      </aside>
    )
  }

  const isSlot = isSlotType(obj.type)

  const handleChange = (field, value) => {
    onUpdate({ [field]: value })
  }

  const handleNumericChange = (field, value) => {
    const num = Number(value)
    if (!isNaN(num)) {
      onUpdate({ [field]: num })
    }
  }

  return (
    <aside className="slot-inspector">
      <div className="slot-inspector__header">
        <div>
          <h3>{isSlot ? 'Slot Inspector' : 'Element Inspector'}</h3>
          <span className="slot-inspector__id">
            {obj.type.toUpperCase()} • {obj.id}
          </span>
        </div>
        {onDeselect && (
          <button
            type="button"
            className="btn btn--subtle btn--small"
            onClick={onDeselect}
            title="Deselect (Esc)"
          >
            Close
          </button>
        )}
      </div>

      <div className="slot-inspector__body">
        {/* Label / Identifier */}
        <div className="form-group">
          <label htmlFor="inspector-label">Label / Identifier</label>
          <input
            id="inspector-label"
            type="text"
            className="form-input"
            value={obj.label || ''}
            placeholder={isSlot ? 'e.g. A-01' : 'e.g. Main Lane'}
            onChange={(e) => handleChange('label', e.target.value)}
          />
        </div>

        {/* Spatial Position Coordinates (X, Y) */}
        <div className="form-row">
          <div className="form-group form-group--half">
            <label htmlFor="inspector-x">X Position</label>
            <input
              id="inspector-x"
              type="number"
              min="0"
              max="1600"
              className="form-input"
              value={obj.x ?? 0}
              onChange={(e) => handleNumericChange('x', e.target.value)}
            />
          </div>
          <div className="form-group form-group--half">
            <label htmlFor="inspector-y">Y Position</label>
            <input
              id="inspector-y"
              type="number"
              min="0"
              max="1000"
              className="form-input"
              value={obj.y ?? 0}
              onChange={(e) => handleNumericChange('y', e.target.value)}
            />
          </div>
        </div>

        {/* Spatial Dimensions (Width, Height) */}
        <div className="form-row">
          <div className="form-group form-group--half">
            <label htmlFor="inspector-width">Width (px)</label>
            <input
              id="inspector-width"
              type="number"
              min="20"
              max="1600"
              className="form-input"
              value={obj.width ?? 80}
              onChange={(e) => handleNumericChange('width', e.target.value)}
            />
          </div>
          <div className="form-group form-group--half">
            <label htmlFor="inspector-height">Height (px)</label>
            <input
              id="inspector-height"
              type="number"
              min="10"
              max="1600"
              className="form-input"
              value={obj.height ?? 120}
              onChange={(e) => handleNumericChange('height', e.target.value)}
            />
          </div>
        </div>

        {/* Slot Specific Properties */}
        {isSlot && (
          <>
            <div className="form-group">
              <label htmlFor="inspector-vehicle">Vehicle Type</label>
              <select
                id="inspector-vehicle"
                className="form-select"
                value={obj.vehicleType || 'car'}
                onChange={(e) => handleChange('vehicleType', e.target.value)}
              >
                {VEHICLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="inspector-status">Availability Status</label>
              <select
                id="inspector-status"
                className="form-select"
                value={obj.status || 'available'}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="inspector-section">Section / Zone</label>
              <input
                id="inspector-section"
                type="text"
                className="form-input"
                value={obj.section || ''}
                placeholder="e.g. Zone A"
                onChange={(e) => handleChange('section', e.target.value)}
              />
            </div>
          </>
        )}

        {/* Rotation Controls */}
        <div className="form-group">
          <div className="form-group__header">
            <label htmlFor="inspector-rotation">Rotation ({obj.rotation || 0}°)</label>
          </div>
          <input
            id="inspector-rotation"
            type="range"
            min="0"
            max="360"
            step="15"
            className="form-range"
            value={obj.rotation || 0}
            onChange={(e) => handleNumericChange('rotation', e.target.value)}
          />
          <div className="preset-buttons">
            {PRESET_ROTATIONS.map((deg) => (
              <button
                key={deg}
                type="button"
                className={`btn btn--small ${obj.rotation === deg ? 'btn--active' : 'btn--subtle'}`}
                onClick={() => handleChange('rotation', deg)}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="slot-inspector__footer">
        {onDuplicate && (
          <button
            type="button"
            className="btn btn--subtle btn--full"
            onClick={() => onDuplicate(obj.id)}
            title="Duplicate Object (Ctrl+D)"
          >
            Duplicate Element
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="btn btn--danger btn--full"
            onClick={() => onDelete(obj.id)}
            title="Delete Object (Delete)"
          >
            Delete Element
          </button>
        )}
      </div>
    </aside>
  )
}
