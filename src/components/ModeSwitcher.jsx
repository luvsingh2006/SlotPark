import './ModeSwitcher.css'

export function ModeSwitcher({ mode, onChange }) {
  return (
    <div className="mode-switcher" role="tablist" aria-label="Application mode">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'admin'}
        className={`mode-switcher__option ${mode === 'admin' ? 'mode-switcher__option--active' : ''}`}
        onClick={() => onChange('admin')}
      >
        Admin Designer
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'visitor'}
        className={`mode-switcher__option ${mode === 'visitor' ? 'mode-switcher__option--active' : ''}`}
        onClick={() => onChange('visitor')}
      >
        Visitor Booking
      </button>
    </div>
  )
}
