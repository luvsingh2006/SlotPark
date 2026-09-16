import './ConfirmDialog.css'

/**
 * A small, reusable confirmation dialog for destructive actions. Reuses the
 * shared .modal-backdrop / .modal-card styles already loaded by ExportModal.
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card confirm-dialog" role="alertdialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <div className="modal-card__title">
            <h3>{title}</h3>
          </div>
        </div>
        <div className="modal-card__body">
          <p className="confirm-dialog__message">{message}</p>
        </div>
        <div className="modal-card__footer">
          <button type="button" className="btn btn--subtle" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
