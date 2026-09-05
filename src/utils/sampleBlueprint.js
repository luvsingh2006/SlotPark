/**
 * CAD-grade architectural site plan SVG sample for Blueprint overlay.
 * Fits standard 1600x1000 canvas with realistic civil engineering drafting layers.
 */
export const SAMPLE_BLUEPRINT_NAME = 'Metro_Civil_Site_Plan_L01.svg'

export const SAMPLE_BLUEPRINT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">
  <defs>
    <!-- Architectural diagonal hatch pattern for building core -->
    <pattern id="cad-hatch" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="20" stroke="#0284c7" stroke-width="1.2" opacity="0.35" />
    </pattern>
    <!-- Landscaping stipple pattern -->
    <pattern id="landscaping-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.5" fill="#10b981" opacity="0.3" />
      <circle cx="12" cy="12" r="1.5" fill="#10b981" opacity="0.3" />
    </pattern>
  </defs>

  <!-- Site Perimeter Setback (Offset 30px) -->
  <rect x="30" y="30" width="1540" height="940" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="10 6" opacity="0.6" />
  <text x="50" y="55" fill="#0284c7" font-family="monospace" font-size="12" font-weight="bold" letter-spacing="2">PROPERTY BOUNDARY: 1540' × 940' [SETBACK 15'-0"]</text>

  <!-- Dimension Lines & CAD Ticks -->
  <g stroke="#0369a1" stroke-width="1.2" opacity="0.7">
    <!-- Top dimension line -->
    <line x1="30" y1="20" x2="1570" y2="20" />
    <line x1="30" y1="12" x2="30" y2="28" />
    <line x1="1570" y1="12" x2="1570" y2="28" />
    <!-- Left dimension line -->
    <line x1="20" y1="30" x2="20" y2="970" />
    <line x1="12" y1="30" x2="28" y2="30" />
    <line x1="12" y1="970" x2="28" y2="970" />
  </g>
  <text x="800" y="16" fill="#0369a1" font-family="monospace" font-size="11" text-anchor="middle" font-weight="600">1600'-0" OVERALL SITE WIDTH</text>
  <text x="14" y="500" fill="#0369a1" font-family="monospace" font-size="11" text-anchor="middle" transform="rotate(-90 14 500)" font-weight="600">1000'-0" OVERALL DEPTH</text>

  <!-- Main Commercial Building Footprint -->
  <rect x="520" y="70" width="560" height="230" fill="url(#cad-hatch)" stroke="#0284c7" stroke-width="2.5" />
  <rect x="520" y="70" width="560" height="230" fill="#0284c7" fill-opacity="0.04" />
  <!-- Entrance Canopies & Columns -->
  <rect x="730" y="295" width="140" height="30" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="4 4" />
  <text x="800" y="180" fill="#0369a1" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle" letter-spacing="3">MAIN TERMINAL BUILDING</text>
  <text x="800" y="210" fill="#0284c7" font-family="monospace" font-size="12" text-anchor="middle">LEVEL 01 • RETAIL &amp; SERVICE PLAZA (128,800 SQ FT)</text>
  <text x="800" y="315" fill="#0284c7" font-family="monospace" font-size="10" text-anchor="middle" font-weight="bold">MAIN PEDESTRIAN CANOPY</text>

  <!-- Drive Aisles / Circulation Centerlines -->
  <g stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="16 10" opacity="0.75">
    <!-- Main Entrance Road from West -->
    <line x1="30" y1="520" x2="1570" y2="520" />
    <!-- Cross Access Aisle A -->
    <line x1="420" y1="340" x2="420" y2="940" />
    <!-- Cross Access Aisle B -->
    <line x1="1180" y1="340" x2="1180" y2="940" />
    <!-- Perimeter Ring Road -->
    <line x1="140" y1="340" x2="1460" y2="340" />
    <line x1="140" y1="910" x2="1460" y2="910" />
  </g>
  <text x="260" y="510" fill="#0284c7" font-family="monospace" font-size="11" font-weight="bold" letter-spacing="1">MAIN CIRCULATION ARTERY (32'-0" WIDE)</text>

  <!-- Landscaped Curbs & Islands -->
  <g stroke="#10b981" stroke-width="1.5" fill="url(#landscaping-pattern)">
    <!-- West Island -->
    <rect x="80" y="360" width="30" height="240" rx="10" />
    <!-- East Island -->
    <rect x="1490" y="360" width="30" height="240" rx="10" />
    <!-- Center Dividing Islands -->
    <rect x="440" y="350" width="24" height="140" rx="8" />
    <rect x="1136" y="350" width="24" height="140" rx="8" />
    <rect x="440" y="550" width="24" height="140" rx="8" />
    <rect x="1136" y="550" width="24" height="140" rx="8" />
    <!-- South Stormwater Retention Basin -->
    <rect x="1260" y="740" width="260" height="180" rx="16" fill="#0ea5e9" fill-opacity="0.1" stroke="#0284c7" stroke-dasharray="6 4" />
  </g>
  <text x="1390" y="835" fill="#0369a1" font-family="monospace" font-size="11" font-weight="600" text-anchor="middle">STORMWATER SETBACK</text>
  <text x="1390" y="852" fill="#0369a1" font-family="monospace" font-size="9" text-anchor="middle">BIO-RETENTION CELL #02</text>

  <!-- North Compass Rose -->
  <g transform="translate(1480, 110)">
    <circle cx="0" cy="0" r="32" fill="none" stroke="#0284c7" stroke-width="1.5" />
    <polygon points="0,-28 7,0 0,-4 -7,0" fill="#0284c7" />
    <polygon points="0,28 7,0 0,4 -7,0" fill="#bae6fd" stroke="#0284c7" stroke-width="0.8" />
    <polygon points="28,0 0,7 4,0 0,-7" fill="#bae6fd" stroke="#0284c7" stroke-width="0.8" />
    <polygon points="-28,0 0,7 -4,0 0,-7" fill="#bae6fd" stroke="#0284c7" stroke-width="0.8" />
    <text x="0" y="-34" fill="#0284c7" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">N</text>
  </g>

  <!-- Architectural Title Block (Bottom-Right) -->
  <g transform="translate(1180, 915)">
    <rect x="0" y="0" width="370" height="70" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5" />
    <line x1="0" y1="24" x2="370" y2="24" stroke="#0284c7" stroke-width="1" />
    <line x1="220" y1="24" x2="220" y2="70" stroke="#0284c7" stroke-width="1" />
    <text x="12" y="16" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="bold">SLOTPARK CIVIL &amp; ARCHITECTURAL BASE</text>
    <text x="12" y="42" fill="#475569" font-family="monospace" font-size="9">SHEET: C-101 (SITE PLAN)</text>
    <text x="12" y="58" fill="#475569" font-family="monospace" font-size="9">SCALE: 1" = 20'-0" | NAD83</text>
    <text x="232" y="42" fill="#475569" font-family="monospace" font-size="9">PROJ: LOT-2026-SP</text>
    <text x="232" y="58" fill="#0284c7" font-family="monospace" font-size="9" font-weight="bold">REF STATUS: APPROVED</text>
  </g>
</svg>`

export function getSampleBlueprintDataUrl() {
  return `data:image/svg+xml;utf8,${encodeURIComponent(SAMPLE_BLUEPRINT_SVG)}`
}
