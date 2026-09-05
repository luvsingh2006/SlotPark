import { useState, useRef } from 'react'
import {
  UploadIcon,
  CheckIcon,
} from './Icons'
import { parseAndValidateLayout } from '../utils/layoutParser'
import './ImportModal.css'

export function ImportModal({
  isOpen = false,
  onClose,
  onImportLayout,
  canvasBounds,
}) {
  const [importMode, setImportMode] = useState('replace') // 'replace' | 'append'
  const [inputTab, setInputTab] = useState('file') // 'file' | 'paste'
  const [pastedText, setPastedText] = useState('')
  const [validationResult, setValidationResult] = useState(null)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleProcessJSON = (jsonString, name = '') => {
    setFileName(name)
    const result = parseAndValidateLayout(jsonString, canvasBounds)
    setValidationResult(result)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        handleProcessJSON(text, file.name)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file && (file.name.endsWith('.json') || file.type.includes('json'))) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result
        if (typeof text === 'string') {
          handleProcessJSON(text, file.name)
        }
      }
      reader.readAsText(file)
    }
  }

  const handlePastedTextChange = (e) => {
    const text = e.target.value
    setPastedText(text)
    if (text.trim()) {
      handleProcessJSON(text, 'Pasted JSON Payload')
    } else {
      setValidationResult(null)
      setFileName('')
    }
  }

  const handleConfirmImport = () => {
    if (!validationResult || !validationResult.success) return
    onImportLayout(validationResult.data, importMode)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card import-modal"
        role="dialog"
        aria-label="Import Layout JSON"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-card__header">
          <div className="modal-card__title">
            <UploadIcon size={18} />
            <h3>Import CAD Floor Plan</h3>
          </div>
          <button
            type="button"
            className="modal-card__close"
            onClick={onClose}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        <div className="modal-card__body">
          <p className="modal-description">
            Upload a standardized SlotPark JSON floor plan or paste layout definitions to restore objects, coordinate bounds, and slot classifications.
          </p>

          {/* Input Method Switcher */}
          <div className="import-tabs">
            <button
              type="button"
              className={`import-tab ${inputTab === 'file' ? 'import-tab--active' : ''}`}
              onClick={() => setInputTab('file')}
            >
              Upload File (.json)
            </button>
            <button
              type="button"
              className={`import-tab ${inputTab === 'paste' ? 'import-tab--active' : ''}`}
              onClick={() => setInputTab('paste')}
            >
              Paste JSON Text
            </button>
          </div>

          {inputTab === 'file' ? (
            <div
              className="import-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <UploadIcon size={28} className="import-dropzone__icon" />
              <div className="import-dropzone__text">
                <span className="dropzone-primary">Click to select or drag &amp; drop file</span>
                <span className="dropzone-secondary">SlotPark JSON schema (*.json)</span>
              </div>
              {fileName && <span className="import-file-badge">{fileName}</span>}
            </div>
          ) : (
            <div className="form-group">
              <textarea
                className="import-textarea"
                rows={5}
                placeholder="Paste your SlotPark layout JSON payload here..."
                value={pastedText}
                onChange={handlePastedTextChange}
              />
            </div>
          )}

          {/* Validation Feedback & Schema Insights */}
          {validationResult && (
            <div className={`import-feedback ${validationResult.success ? 'import-feedback--success' : 'import-feedback--error'}`}>
              {validationResult.success ? (
                <>
                  <div className="feedback-header">
                    <CheckIcon size={16} />
                    <span className="feedback-title">Valid Layout Schema Verified</span>
                  </div>
                  <div className="feedback-details">
                    <span>Project: <strong>{validationResult.data.metadata.name}</strong></span>
                    <span>Total Elements: <strong>{validationResult.summary.totalParsed}</strong> ({validationResult.summary.slotsCount} parking stalls, {validationResult.summary.structuresCount} structures)</span>
                  </div>
                  {validationResult.summary.warnings.length > 0 && (
                    <div className="feedback-warnings">
                      {validationResult.summary.warnings.map((w, idx) => (
                        <div key={idx} className="warning-item">• {w}</div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="feedback-error-msg">
                  <strong>Schema Validation Error:</strong> {validationResult.error}
                </div>
              )}
            </div>
          )}

          {/* Import Mode Options */}
          {validationResult?.success && (
            <div className="import-mode-selector">
              <span className="import-mode-title">Placement Mode:</span>
              <div className="import-mode-radios">
                <label className="import-radio-label">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                  />
                  <span>Replace current layout (Clear canvas)</span>
                </label>
                <label className="import-radio-label">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                  />
                  <span>Append to existing objects</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="modal-card__footer">
          <button
            type="button"
            className="btn btn--subtle"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn--primary"
            disabled={!validationResult || !validationResult.success}
            onClick={handleConfirmImport}
          >
            <UploadIcon size={14} />
            <span>{importMode === 'replace' ? 'Load & Replace Canvas' : 'Append Objects'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
