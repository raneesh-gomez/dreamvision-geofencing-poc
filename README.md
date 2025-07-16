# 🌍 DreamVision Geofencing Portal

A modern web portal for visualizing and managing **geofences** across microfinance institution (MFI) hierarchies. Built with React, Vite, Google Maps API, and Tailwind CSS (ShadCN UI), this platform enables structured creation, drawing, and metadata association of polygon-based geofences.

## 🚀 Features

- 🔒 Form-driven geofence creation (name, type, priority, parent, metadata)
- 🖍️ Google Maps polygon drawing, editable in real-time
- 🧠 Dynamic key-value metadata fields
- 🧭 Parent-child hierarchy support for geofences
- 🎨 Tailwind + ShadCN UI for enterprise-grade design
- ⚙️ TypeScript-first codebase

## 🛠️ Tech Stack

| Layer        | Tools Used                             |
|--------------|-----------------------------------------|
| Frontend     | React + Vite                            |
| Mapping      | `@vis.gl/react-google-maps`, Google Maps API |
| UI Framework | TailwindCSS + [shadcn/ui](https://ui.shadcn.com) |
| Language     | TypeScript                              |

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
