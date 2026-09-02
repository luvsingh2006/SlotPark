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

export function SlotInspector({ slot, onUpdate, onDeselect, onDelete }) {
  if (!slot) {
    return (
      <aside className="slot-inspector slot-inspector--empty">
        <div className="slot-inspector__placeholder">
          <h3>No Slot Selected</h3>
          <p>Click on any parking slot in the grid to inspect and modify its attributes.</p>
        </div>
      </aside>
    )
  }

  const handleChange = (field, value) => {
    onUpdate({ [field]: value })
  }

  return (
    <aside className="slot-inspector">
      <div className="slot-inspector__header">
        <div>
          <h3>Slot Inspector</h3>
          <span className="slot-inspector__id">{slot.id}</span>
        </div>
        {onDeselect && (
          <button
            type="button"
            className="btn btn--subtle btn--small"
            onClick={onDeselect}
            title="Deselect slot"
          >
            Close
          </button>
        )}
      </div>

      <div className="slot-inspector__body">
        <div className="form-group">
          <label htmlFor="inspector-label">Slot Label</label>
          <input
            id="inspector-label"
            type="text"
            className="form-input"
            value={slot.label || ''}
            placeholder="e.g. A-01"
            onChange={(e) => handleChange('label', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="inspector-vehicle">Vehicle Type</label>
          <select
            id="inspector-vehicle"
            className="form-select"
            value={slot.vehicleType || 'car'}
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
            value={slot.status || 'available'}
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
            value={slot.section || ''}
            placeholder="e.g. Zone A"
            onChange={(e) => handleChange('section', e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="form-group__header">
            <label htmlFor="inspector-rotation">Rotation ({slot.rotation || 0}°)</label>
          </div>
          <input
            id="inspector-rotation"
            type="range"
            min="0"
            max="360"
            step="15"
            className="form-range"
            value={slot.rotation || 0}
            onChange={(e) => handleChange('rotation', Number(e.target.value))}
          />
          <div className="preset-buttons">
            {PRESET_ROTATIONS.map((deg) => (
              <button
                key={deg}
                type="button"
                className={`btn btn--small ${slot.rotation === deg ? 'btn--active' : 'btn--subtle'}`}
                onClick={() => handleChange('rotation', deg)}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>
      </div>

      {onDelete && (
        <div className="slot-inspector__footer">
          <button
            type="button"
            className="btn btn--danger btn--full"
            onClick={() => onDelete(slot.id)}
          >
            Delete Slot
          </button>
        </div>
      )}
    </aside>
  )
}
