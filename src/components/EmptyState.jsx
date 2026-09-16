import './EmptyState.css'

/**
 * A friendly empty-state block with a simple illustration, used wherever a
 * list or canvas has nothing to show yet (no slots designed, no bookings
 * made, etc).
 */
export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="empty-state">
      <svg
        className="empty-state__illustration"
        viewBox="0 0 120 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="10" y="20" width="100" height="50" rx="6" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2" />
        <rect x="24" y="34" width="24" height="36" rx="3" fill="#e5e7eb" />
        <rect x="72" y="34" width="24" height="36" rx="3" fill="#e5e7eb" />
        <path d="M10 30 L110 30" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="60" cy="12" r="8" fill="#dbeafe" />
        <path d="M56 12 h8 M60 8 v8" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <h3 className="empty-state__title">{title}</h3>
      {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
      {action}
    </div>
  )
}
