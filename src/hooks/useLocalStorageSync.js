import { useEffect, useRef, useState } from 'react'

/**
 * Sync a piece of React state with localStorage under the given key.
 *
 * On mount, reads any previously saved value from localStorage and uses it
 * as the initial state (falling back to `initialValue` if nothing is saved
 * or the saved JSON is corrupt). After that, every time the returned state
 * changes, it's written back to localStorage automatically.
 *
 * Usage:
 *   const [objects, setObjects] = useLocalStorageSync('parkslot_layout', INITIAL_LAYOUT_OBJECTS)
 */
export function useLocalStorageSync(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch (error) {
      console.warn(`useLocalStorageSync: failed to read "${key}" from localStorage`, error)
      return initialValue
    }
  })

  // Skip writing on the very first render, since we just read this value.
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`useLocalStorageSync: failed to write "${key}" to localStorage`, error)
    }
  }, [key, value])

  return [value, setValue]
}
