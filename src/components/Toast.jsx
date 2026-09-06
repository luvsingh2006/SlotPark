import { useCallback, useState } from 'react'
import './Toast.css'

/**
 * A minimal toast manager. Call showToast(message) to display a message for
 * a few seconds. Render <ToastViewport toasts={toasts} /> once near the root
 * of the visitor view.
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, tone = 'warning') => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    setToasts((prev) => [...prev, { id, message, tone }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  return { toasts, showToast }
}

export function ToastViewport({ toasts }) {
  if (!toasts.length) return null

  return (
    <div className="toast-viewport">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}
