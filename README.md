# heatmap-libs

A collection of heatmap libraries including heatmap.js and Leaflet heatmap plugin for creating beautiful heatmap visualizations.

## Installation

```bash
npm install heatmap-libs
```

## Usage

### Basic Heatmap

```javascript
const { heatmap } = require('heatmap-libs');

// Create a heatmap instance
const heatmapInstance = heatmap.create({
  container: document.getElementById('heatmap-container'),
  radius: 40,
  maxOpacity: 0.8,
  minOpacity: 0,
  blur: 0.85
});

// Add data points
heatmapInstance.addData({
  x: 10,
  y: 15,
  value: 100
});
```

### Leaflet Heatmap

```javascript
const L = require('leaflet');
const { HeatmapOverlay } = require('heatmap-libs');

// Create a map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create heatmap overlay
const heatmapLayer = new HeatmapOverlay({
  radius: 2,
  maxOpacity: 0.8,
  scaleRadius: true,
  useLocalExtrema: true,
  latField: 'lat',
  lngField: 'lng',
  valueField: 'count'
});

// Add heatmap data
const heatmapData = {
  max: 100,
  data: [
    {lat: 51.505, lng: -0.09, count: 100},
    {lat: 51.51, lng: -0.1, count: 80},
    {lat: 51.49, lng: -0.08, count: 60}
  ]
};

heatmapLayer.setData(heatmapData);
map.addLayer(heatmapLayer);
```

## API Reference

### Heatmap.js

The main heatmap library provides:

- `heatmap.create(config)` - Create a new heatmap instance
- `heatmapInstance.addData(data)` - Add data points to the heatmap
- `heatmapInstance.setData(data)` - Set all data at once
- `heatmapInstance.configure(config)` - Update configuration
- `heatmapInstance.getDataURL()` - Get heatmap as data URL

### Leaflet Heatmap Plugin

The Leaflet plugin provides:

- `HeatmapOverlay` - Leaflet layer for displaying heatmaps on maps
- Supports automatic scaling with zoom levels
- Integrates seamlessly with Leaflet maps

## Configuration Options

### Heatmap.js Configuration

- `container` - DOM element to render the heatmap
- `radius` - Default radius for data points
- `maxOpacity` - Maximum opacity (0-1)
- `minOpacity` - Minimum opacity (0-1)
- `blur` - Blur factor (0-1)
- `gradient` - Custom color gradient

### Leaflet Heatmap Configuration

- `radius` - Point radius
- `maxOpacity` - Maximum opacity
- `scaleRadius` - Scale radius with zoom
- `useLocalExtrema` - Use local min/max values
- `latField` - Latitude field name
- `lngField` - Longitude field name
- `valueField` - Value field name

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
