import { useRef } from 'react'
import {
  BlueprintIcon,
  EyeIcon,
  EyeOffIcon,
  UploadIcon,
} from './Icons'
import {
  SAMPLE_BLUEPRINT_NAME,
  getSampleBlueprintDataUrl,
} from '../utils/sampleBlueprint'
import './BlueprintPanel.css'

export function BlueprintPanel({
  blueprint,
  onUpdateBlueprint,
  isOpen,
  onClose,
}) {
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (typeof dataUrl === 'string') {
        onUpdateBlueprint({
          url: dataUrl,
          name: file.name,
          visible: true,
        })
      }
    }
    reader.readAsDataURL(file)
    // reset input so the same file can be re-selected if needed
    e.target.value = ''
  }

  const handleLoadSample = () => {
    onUpdateBlueprint({
      url: getSampleBlueprintDataUrl(),
      name: SAMPLE_BLUEPRINT_NAME,
      visible: true,
    })
  }

  const handleClearBlueprint = () => {
    onUpdateBlueprint({
      url: null,
      name: null,
    })
  }

  const opacityPercent = Math.round((blueprint.opacity ?? 0.4) * 100)

  return (
    <div className="blueprint-panel" role="dialog" aria-label="Reference Blueprint Settings">
      <div className="blueprint-panel__header">
        <div className="blueprint-panel__title">
          <BlueprintIcon size={16} />
          <h4>Blueprint Overlay</h4>
        </div>
        <button
          type="button"
          className="blueprint-panel__close"
          onClick={onClose}
          aria-label="Close"
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>

      <div className="blueprint-panel__body">
        {/* Active Blueprint Status */}
        {blueprint.url ? (
          <div className="blueprint-status">
            <div className="blueprint-status__info">
              <span className="blueprint-status__dot" />
              <span className="blueprint-status__name" title={blueprint.name || 'Custom Blueprint'}>
                {blueprint.name || 'Custom Blueprint'}
              </span>
            </div>
            <div className="blueprint-status__actions">
              <button
                type="button"
                className={`btn-icon ${blueprint.visible ? 'btn-icon--active' : ''}`}
                onClick={() => onUpdateBlueprint({ visible: !blueprint.visible })}
                title={blueprint.visible ? 'Hide Blueprint' : 'Show Blueprint'}
              >
                {blueprint.visible ? <EyeIcon size={16} /> : <EyeOffIcon size={16} />}
              </button>
              <button
                type="button"
                className="btn btn--subtle btn--small"
                onClick={handleClearBlueprint}
                title="Remove Blueprint"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="blueprint-empty-tip">
            No blueprint loaded. Upload a site CAD drawing or load the built-in sample.
          </div>
        )}

        {/* Action Buttons */}
        <div className="blueprint-panel__buttons">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="btn btn--subtle blueprint-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon size={14} />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            className="btn btn--subtle blueprint-btn"
            onClick={handleLoadSample}
          >
            <BlueprintIcon size={14} />
            <span>Sample CAD</span>
          </button>
        </div>

        {/* Opacity Control */}
        {blueprint.url && (
          <div className="blueprint-slider-group">
            <div className="blueprint-slider-group__header">
              <label htmlFor="blueprint-opacity-slider">Overlay Opacity</label>
              <span className="blueprint-slider-badge">{opacityPercent}%</span>
            </div>
            <input
              id="blueprint-opacity-slider"
              type="range"
              min="5"
              max="100"
              step="5"
              value={opacityPercent}
              className="blueprint-range-slider"
              disabled={!blueprint.visible}
              onInput={(e) =>
                onUpdateBlueprint({ opacity: Number(e.target.value) / 100 })
              }
              onChange={(e) =>
                onUpdateBlueprint({ opacity: Number(e.target.value) / 100 })
              }
            />
            <div className="blueprint-presets">
              {[20, 40, 60, 80].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`blueprint-preset-btn ${opacityPercent === preset ? 'blueprint-preset-btn--active' : ''}`}
                  disabled={!blueprint.visible}
                  onClick={() => onUpdateBlueprint({ opacity: preset / 100 })}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
