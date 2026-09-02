# SlotPark

An interactive, visual parking layout designer and reservation system built with React and Vite.

SlotPark allows parking administrators to design and manage real-world parking lot floor plans using a visual canvas editor, while giving visitors a straightforward interface to check slot availability and schedule reservations without time conflicts.

---

## Key Features

- **Spatial Layout Designer:** Free-form 2D canvas supporting pan/zoom, drag-and-drop positioning, custom slot dimensions, and rotation angles for angled parking.
- **Vehicle & Slot Types:** Dedicated configurations for standard cars, electric vehicles (EV), motorcycles/bikes, trucks, and accessible parking spaces.
- **Blueprint / Map Overlay:** Support for uploading reference floor plans or satellite images behind the layout for accurate space tracing.
- **Conflict-Free Reservation Engine:** Automated overlap detection preventing double-bookings across requested date and time intervals.
- **Persistence & Export:** Client-side storage via browser LocalStorage with full JSON layout export/import capability.

---

## Tech Stack

- **Frontend:** React 19, JavaScript (ES6+)
- **Build Tool:** Vite
- **Styling:** Vanilla CSS (CSS Grid, Flexbox, custom properties)
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/luvsingh2006/SlotPark.git
   cd SlotPark
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## Available Scripts

- `npm run dev` — Starts the local development server with Hot Module Replacement (HMR).
- `npm run build` — Compiles and bundles production-ready assets into the `dist/` directory.
- `npm run preview` — Locally previews the production build.

---

## Project Structure

```
SlotPark/
├── public/              # Static assets
├── src/
│   ├── components/      # UI components (ParkingSlot, SlotInspector, etc.)
│   ├── utils/           # Time calculation, validation, and storage helpers
│   ├── App.jsx          # Root application component and state coordinator
│   ├── App.css          # Core application styling
│   ├── index.css        # Global CSS reset and typography
│   └── main.jsx         # React application entry point
├── index.html           # Single Page Application HTML root
├── package.json         # Project metadata and dependencies
└── vite.config.js       # Vite build configuration
```

---

## License

This project is licensed under the MIT License.
