// Heatmap libraries for npm
// This file provides proper module exports for the heatmap libraries

// Export heatmap.js
const heatmap = require('./heatmap.min.js');

// Export leaflet-heatmap plugin
const leafletHeatmap = require('./leaflet-heatmap.js');

module.exports = {
  heatmap: heatmap,
  leafletHeatmap: leafletHeatmap,
  // Also export individual components for convenience
  HeatmapOverlay: leafletHeatmap.HeatmapOverlay
};

// For ES6 module compatibility
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = {
      heatmap: heatmap,
      leafletHeatmap: leafletHeatmap,
      HeatmapOverlay: leafletHeatmap.HeatmapOverlay
    };
  }
} 