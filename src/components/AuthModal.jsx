import React, { useState, useEffect } from 'react'
import { registerUser, loginUser, DEMO_CREDENTIALS } from '../utils/cryptoAuth'
import { LockIcon, UserIcon, ShieldIcon, EyeIcon, EyeOffIcon } from './Icons'
import './AuthModal.css'

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  currentLotName = 'SlotPark Hub',
}) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [lotName, setLotName] = useState(currentLotName)
  const [phone, setPhone] = useState('')
  const [businessId, setBusinessId] = useState('')
  
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setError(null)
      setPassword('')
      setConfirmPassword('')
      setLotName(currentLotName || 'SlotPark Hub')
    }
  }, [isOpen, initialMode, currentLotName])

  if (!isOpen) return null

  const handleFillDemo = () => {
    setMode('login')
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password)
        if (!res.success) {
          setError(res.error || 'Invalid email or password.')
          setLoading(false)
          return
        }
        onSuccess(res.user)
        onClose()
      } else {
        // Register validation
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.')
          setLoading(false)
          return
        }
        if (!fullName.trim()) {
          setError('Please provide the lot owner name.')
          setLoading(false)
          return
        }

        const res = await registerUser({
          email,
          password,
          fullName,
          lotName: lotName.trim() || 'SlotPark Hub',
          phone: phone.trim(),
          businessId: businessId.trim(),
        })

        if (!res.success) {
          setError(res.error || 'Failed to register account.')
          setLoading(false)
          return
        }
        onSuccess(res.user)
        onClose()
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="auth-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          ✕
        </button>

        <div className="auth-header">
          <div className="auth-badge">
            <ShieldIcon size={16} className="auth-shield-icon" />
            <span>Owner Portal</span>
          </div>
          <h2 id="auth-modal-title" className="auth-title">
            {mode === 'login' ? 'Lot Owner Sign In' : 'Register Parking Facility'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Access real-time layout management, slot configuration, and live facility stats.'
              : 'Create a manager account to design and operate your smart parking lot.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login')
              setError(null)
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register')
              setError(null)
            }}
          >
            Register Facility
          </button>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="auth-form-row">
                <div className="auth-field">
                  <label htmlFor="owner-name">Owner / Manager Name *</label>
                  <div className="auth-input-wrapper">
                    <UserIcon size={16} className="auth-field-icon" />
                    <input
                      id="owner-name"
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="lot-name">Facility / Lot Name *</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="lot-name"
                      type="text"
                      required
                      placeholder="e.g. Downtown Metro Hub"
                      value={lotName}
                      onChange={(e) => setLotName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-field">
                  <label htmlFor="owner-phone">Contact Phone (Optional)</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="owner-phone"
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="business-id">License / Tax ID (Optional)</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="business-id"
                      type="text"
                      placeholder="e.g. PL-884920"
                      value={businessId}
                      onChange={(e) => setBusinessId(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email Address *</label>
            <div className="auth-input-wrapper">
              <input
                id="auth-email"
                type="email"
                required
                placeholder="manager@parkinglot.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <div className="auth-field-label-group">
              <label htmlFor="auth-password">Password *</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="auth-demo-hint-btn"
                  onClick={handleFillDemo}
                  title="Fill demo owner credentials"
                >
                  Fill Demo Account
                </button>
              )}
            </div>
            <div className="auth-input-wrapper">
              <LockIcon size={16} className="auth-field-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-pw-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="confirm-password">Confirm Password *</label>
              <div className="auth-input-wrapper">
                <LockIcon size={16} className="auth-field-icon" />
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="auth-crypto-notice">
            <ShieldIcon size={14} className="auth-crypto-icon" />
            <span>
              <strong>Zero-Knowledge Storage:</strong> Passwords are cryptographically salted and hashed using native PBKDF2-SHA256 (100k rounds) before saving. Plain text passwords are never stored or exposed.
            </span>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : mode === 'login' ? (
              'Sign In as Lot Owner'
            ) : (
              'Create Lot Owner Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? (
            <p>
              Don't have an owner account?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setMode('register')
                  setError(null)
                }}
              >
                Register a new facility
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
