import { useState, useMemo } from 'react'
import {
  DownloadIcon,
  CopyIcon,
  CheckIcon,
} from './Icons'
import {
  exportLayoutToJSON,
  downloadLayoutFile,
} from '../utils/layoutSerialization'
import './ExportModal.css'

export function ExportModal({
  isOpen = false,
  onClose,
  objects = [],
  blueprint = null,
}) {
  const [projectName, setProjectName] = useState('Metro Plaza Parking Layout')
  const [author, setAuthor] = useState('SlotPark Designer')
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const jsonPreview = useMemo(() => {
    if (!isOpen) return ''
    return exportLayoutToJSON(objects, {
      name: projectName,
      author,
      blueprint,
    })
  }, [isOpen, objects, projectName, author, blueprint])

  if (!isOpen) return null

  const handleDownload = () => {
    downloadLayoutFile(objects, {
      name: projectName,
      author,
      blueprint,
    })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonPreview)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback if clipboard API unavailable
      const textArea = document.createElement('textarea')
      textArea.value = jsonPreview
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const payloadSizeKb = (jsonPreview.length / 1024).toFixed(1)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card export-modal"
        role="dialog"
        aria-label="Export Layout JSON"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-card__header">
          <div className="modal-card__title">
            <DownloadIcon size={18} />
            <h3>Export CAD Layout</h3>
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
            Export your complete parking floor plan, coordinates, rotation angles, and vehicle classifications as a standardized JSON schema.
          </p>

          <div className="form-group">
            <label htmlFor="export-project-name">Project / Lot Name</label>
            <input
              id="export-project-name"
              type="text"
              className="form-input"
              value={projectName}
              placeholder="e.g. Downtown Plaza Level 1"
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="export-author">Architect / Author</label>
            <input
              id="export-author"
              type="text"
              className="form-input"
              value={author}
              placeholder="e.g. Lead Civil Engineer"
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          {/* Quick Payload Stats */}
          <div className="export-summary-box">
            <div className="export-summary-metric">
              <span className="export-summary-metric__val">{objects.length}</span>
              <span className="export-summary-metric__lbl">Objects</span>
            </div>
            <div className="export-summary-metric">
              <span className="export-summary-metric__val">{payloadSizeKb} KB</span>
              <span className="export-summary-metric__lbl">File Size</span>
            </div>
            <div className="export-summary-metric">
              <span className="export-summary-metric__val">v1.0</span>
              <span className="export-summary-metric__lbl">Schema</span>
            </div>
          </div>

          {/* Collapsible JSON Preview */}
          <div className="export-preview-toggle">
            <button
              type="button"
              className="btn btn--subtle btn--small"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              {showPreview ? 'Hide JSON Preview' : 'Show JSON Preview'}
            </button>
          </div>

          {showPreview && (
            <div className="export-json-container">
              <pre className="export-json-code">
                <code>{jsonPreview}</code>
              </pre>
            </div>
          )}
        </div>

        <div className="modal-card__footer">
          <button
            type="button"
            className="btn btn--subtle"
            onClick={handleCopy}
            title="Copy formatted JSON to clipboard"
          >
            {copied ? (
              <>
                <CheckIcon size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon size={14} />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn--primary"
            onClick={handleDownload}
            title="Download JSON layout file"
          >
            <DownloadIcon size={14} />
            <span>Download JSON</span>
          </button>
        </div>
      </div>
    </div>
  )
}
