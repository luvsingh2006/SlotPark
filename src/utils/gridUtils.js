export const DEFAULT_GRID_SIZE = 20

/**
 * Snap a scalar coordinate to the nearest grid step.
 */
export function snapToGrid(value, gridSize = DEFAULT_GRID_SIZE) {
  if (!gridSize || gridSize <= 1) return Math.round(value)
  return Math.round(value / gridSize) * gridSize
}

/**
 * Snap an (x, y) 2D coordinate point to the grid.
 */
export function snapPointToGrid(x, y, gridSize = DEFAULT_GRID_SIZE) {
  return {
    x: snapToGrid(x, gridSize),
    y: snapToGrid(y, gridSize),
  }
}

/**
 * Align an object's top-left coordinates so that either its center or bounds
 * snap cleanly to the grid.
 */
export function snapObjectPosition(x, y, width, height, gridSize = DEFAULT_GRID_SIZE) {
  return {
    x: snapToGrid(x, gridSize),
    y: snapToGrid(y, gridSize),
  }
}

/**
 * Clamp object position coordinates so the object stays strictly inside
 * the canvas viewport boundary limits.
 */
export function clampToBounds(
  x,
  y,
  width = 80,
  height = 120,
  canvasWidth = 1600,
  canvasHeight = 1000
) {
  const maxX = Math.max(0, canvasWidth - width)
  const maxY = Math.max(0, canvasHeight - height)
  return {
    x: Math.max(0, Math.min(maxX, Math.round(x))),
    y: Math.max(0, Math.min(maxY, Math.round(y))),
  }
}
