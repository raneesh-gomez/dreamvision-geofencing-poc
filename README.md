# 🌍 DreamVision Geofencing Portal

A modern web portal for visualizing and managing **geofences** across microfinance institution (MFI) hierarchies. Built with React, Vite, Google Maps API, and Tailwind CSS (ShadCN UI), this platform enables structured creation, drawing, and metadata association of polygon-based geofences.

## 🚀 Features

### 🖍️ Geofence Creation & Drawing

- Form-driven creation
- Map-based polygon drawing with live edit support
- Dynamic metadata assignment with key-value pairs

### 🧭 Geofence Hierarchy Validation

- Enforces valid parent-child relationships
- Validates containment (child must lie entirely within parent)
- Validates structural rules (e.g.: Branch must be inside Country, Sub-branch must be inside Branch etc.)

### 🎯 Effective Area Calculation (Advanced Turf.js Logic)

- Detects polygon overlaps within the same geofence level
- Computes visible effective area using priority values
- Visualizes non-overlapping dominant polygons
- Toggle-able effective area overlay

### 🧷 Snap-to-Country Feature

- Automatically draws country geofences to match official boundaries
- Supports country selection via dropdown
- Uses **GeoBoundaries API** to fetch official ADM0 country borders
- MultiPolygon support with auto-splitting into uniquely named geofences

### 📤 Export Functionality

- Export all geofences as **GeoJSON** for map compatibility and integration

### 💅 Elegant UI/UX

- Built with [ShadCN UI](https://ui.shadcn.com) and TailwindCSS

## 🛠️ Tech Stack

| Layer         | Tools Used                                  |
|---------------|----------------------------------------------|
| Frontend      | React + Vite                                 |
| Mapping       | `@vis.gl/react-google-maps`, Google Maps API |
| UI Framework  | TailwindCSS + [ShadCN UI](https://ui.shadcn.com) |
| Geometry Utils| Turf.js                                       |
| Language      | TypeScript                                   |

## 📦 Installation

```bash
git clone git@github.com:raneesh-gomez/dreamvision-geofencing-poc.git
cd dreamvision-geofencing-poc
npm install
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Do **not** commit your `.env` file to version control.

## 💻 Development

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧑‍💻 Contributing

Pull requests are welcome! For major changes, please open an issue to discuss your ideas first.

## License

MIT
