/**
 * Cryptographic Authentication & User Management Engine for SlotPark
 * Utilizes the native browser Web Crypto API (PBKDF2 with SHA-256 and unique salts).
 * Passwords are never stored or handled in plain text.
 */

const USERS_STORAGE_KEY = 'parkslot_users'
const SESSION_STORAGE_KEY = 'parkslot_session'
const PBKDF2_ITERATIONS = 100000

// Helper to convert ArrayBuffer to hex string
function bufferToHex(buffer) {
  const byteArray = new Uint8Array(buffer)
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Helper to convert hex string to Uint8Array
function hexToBuffer(hexString) {
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16)
  }
  return bytes
}

/**
 * Generates a cryptographically secure 16-byte random salt.
 */
export function generateSalt() {
  const salt = new Uint8Array(16)
  window.crypto.getRandomValues(salt)
  return bufferToHex(salt)
}

/**
 * Derives a PBKDF2 cryptographic hash from a plain text password and salt.
 */
export async function hashPassword(password, saltHex) {
  const encoder = new TextEncoder()
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  const saltBuffer = hexToBuffer(saltHex)

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  const exportedRaw = await window.crypto.subtle.exportKey('raw', derivedKey)
  return bufferToHex(exportedRaw)
}

/**
 * Verifies if an input password matches the stored cryptographic hash.
 */
export async function verifyPassword(password, storedHash, saltHex) {
  const computedHash = await hashPassword(password, saltHex)
  return computedHash === storedHash
}

/**
 * Retrieves all registered users from local storage.
 */
export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Saves users list to local storage.
 */
function saveStoredUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (err) {
    console.error('Failed to save users database', err)
  }
}

/**
 * Registers a new facility owner or manager.
 */
export async function registerUser({
  email,
  password,
  fullName,
  lotName,
  phone = '',
  businessId = '',
  role = 'owner',
}) {
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { success: false, error: 'Please provide a valid email address.' }
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' }
  }

  const users = getStoredUsers()
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail)
  if (existing) {
    return { success: false, error: 'An account with this email address already exists.' }
  }

  const salt = generateSalt()
  const passwordHash = await hashPassword(password, salt)

  const newUser = {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    email: normalizedEmail,
    fullName: fullName?.trim() || 'Facility Owner',
    lotName: lotName?.trim() || 'Central Parking Plaza',
    phone: phone?.trim(),
    businessId: businessId?.trim(),
    role,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveStoredUsers(users)

  // Start active session
  const safeSessionUser = getSafeUser(newUser)
  saveSession(safeSessionUser)

  return { success: true, user: safeSessionUser }
}

export const DEMO_CREDENTIALS = {
  email: 'owner@slotpark.com',
  password: 'adminpassword123',
}

/**
 * Authenticates a user with email and password.
 */
export async function loginUser(emailOrObj, maybePassword) {
  const email = typeof emailOrObj === 'object' && emailOrObj !== null ? emailOrObj.email : emailOrObj
  const password = typeof emailOrObj === 'object' && emailOrObj !== null ? emailOrObj.password : maybePassword

  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail || !password) {
    return { success: false, error: 'Please enter both your email and password.' }
  }

  const users = getStoredUsers()
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail)

  if (!user) {
    return { success: false, error: 'No account found with this email. Please register first.' }
  }

  const isValid = await verifyPassword(password, user.passwordHash, user.salt)
  if (!isValid) {
    return { success: false, error: 'Incorrect password. Please try again.' }
  }

  const safeSessionUser = getSafeUser(user)
  saveSession(safeSessionUser)

  return { success: true, user: safeSessionUser }
}

/**
 * Returns user profile without passwordHash and salt.
 */
export function getSafeUser(user) {
  if (!user) return null
  const { passwordHash, salt, ...safe } = user
  return safe
}

/**
 * Returns current active session user or null.
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    // Verify user still exists in database
    const users = getStoredUsers()
    const user = users.find((u) => u.id === session.id)
    return user ? getSafeUser(user) : null
  } catch {
    return null
  }
}

/**
 * Saves current active session.
 */
export function saveSession(user) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
  } catch (err) {
    console.error('Failed to save session', err)
  }
}

/**
 * Clears current session (Log Out).
 */
export function logoutUser() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch (err) {
    console.error('Failed to clear session', err)
  }
}

/**
 * Seeds default owner account if database is completely empty.
 */
export async function initializeDemoOwnerIfEmpty() {
  const users = getStoredUsers()
  if (users.length === 0) {
    await registerUser({
      email: 'owner@slotpark.com',
      password: 'adminpassword123',
      fullName: 'Alex Vance',
      lotName: 'Metro Civic Center Parking',
      phone: '+1 (555) 234-5678',
      businessId: 'LOT-CIVIC-2026',
      role: 'owner',
    })
  }
}
