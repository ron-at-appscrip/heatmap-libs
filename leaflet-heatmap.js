(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.leafletHeatmap = {}));
}(this, function (exports) {
  'use strict';

  var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);
  var h337 = (typeof window !== "undefined" ? window.h337 : typeof global !== "undefined" ? global.h337 : null);

  if (!L) {
    throw new Error('Leaflet must be loaded before leaflet-heatmap');
  }

  if (!h337) {
    throw new Error('heatmap.js must be loaded before leaflet-heatmap');
  }

  var HeatmapOverlay = L.Layer.extend({
    initialize: function (config) {
      this.cfg = config;
      this._el = L.DomUtil.create('div', 'leaflet-zoom-hide');
      this._data = [];
      this._max = 1;
      this._min = 0;
      this.cfg.container = this._el;
    },

    onAdd: function (map) {
      let size = map.getSize();

      this._map = map;

      this._width = size.x;
      this._height = size.y;

      this._el.style.width = size.x + 'px';
      this._el.style.height = size.y + 'px';
      this._el.style.position = 'absolute';

      this._origin = this._map.layerPointToLatLng(new L.Point(0, 0));

      map.getPanes().overlayPane.appendChild(this._el);

      if (!this._heatmap) {
        this._heatmap = h337.create(this.cfg);
      }

      // this resets the origin and redraws whenever
      // the zoom changed or the map has been moved
      map.on('moveend', this._reset, this);
      this._draw();
    },

    onRemove: function (map) {
      // remove layer's DOM elements and listeners
      map.getPanes().overlayPane.removeChild(this._el);

      map.off('moveend', this._reset, this);
    },

    _draw: function () {
      if (!this._map) {
        return;
      }

      let mapPane = this._map.getPanes().mapPane;
      let point = mapPane._leaflet_pos;

      // reposition the layer
      this._el.style[HeatmapOverlay.CSS_TRANSFORM] =
        'translate(' + -Math.round(point.x) + 'px,' + -Math.round(point.y) + 'px)';

      this._update();
    },

    _update: function () {
      let bounds, zoom, scale;
      let generatedData = { max: this._max, min: this._min, data: [] };

      bounds = this._map.getBounds();
      zoom = this._map.getZoom();
      scale = Math.pow(2, zoom);

      if (this._data.length == 0) {
        if (this._heatmap) {
          this._heatmap.setData(generatedData);
        }
        return;
      }

      let latLngPoints = [];
      let radiusMultiplier = this.cfg.scaleRadius ? scale : 1;
      let localMax = 0;
      let localMin = 0;
      let valueField = this.cfg.valueField;
      let len = this._data.length;

      while (len--) {
        let entry = this._data[len];
        let value = entry[valueField];
        let latlng = entry.latlng;

        // we don't wanna render points that are not even on the map ;-)
        if (!bounds.contains(latlng)) {
          continue;
        }
        // local max is the maximum within current bounds
        localMax = Math.max(value, localMax);
        localMin = Math.min(value, localMin);

        let point = this._map.latLngToContainerPoint(latlng);
        let latlngPoint = { x: Math.round(point.x), y: Math.round(point.y) };
        latlngPoint[valueField] = value;

        let radius;

        if (entry.radius) {
          radius = entry.radius * radiusMultiplier;
        } else {
          radius = (this.cfg.radius || 2) * radiusMultiplier;
        }
        latlngPoint.radius = radius;
        latLngPoints.push(latlngPoint);
      }
      if (this.cfg.useLocalExtrema) {
        generatedData.max = localMax;
        generatedData.min = localMin;
      }

      generatedData.data = latLngPoints;

      this._heatmap.setData(generatedData);
    },

    setData: function (data) {
      this._max = data.max || this._max;
      this._min = data.min || this._min;
      let latField = this.cfg.latField || 'lat';
      let lngField = this.cfg.lngField || 'lng';
      let valueField = this.cfg.valueField || 'value';

      // transform data to latlngs
      let len = data.length;
      let d = [];

      while (len--) {
        let entry = data[len];
        let latlng = new L.LatLng(entry[latField], entry[lngField]);
        let dataObj = { latlng: latlng };
        dataObj[valueField] = entry[valueField];
        if (entry.radius) {
          dataObj.radius = entry.radius;
        }
        d.push(dataObj);
      }
      this._data = d;

      this._draw();
    },

    addData: function (pointOrArray) {
      if (pointOrArray.length > 0) {
        let len = pointOrArray.length;
        while (len--) {
          this.addData(pointOrArray[len]);
        }
      } else {
        let latField = this.cfg.latField || 'lat';
        let lngField = this.cfg.lngField || 'lng';
        let valueField = this.cfg.valueField || 'value';
        let entry = pointOrArray;
        let latlng = new L.LatLng(entry[latField], entry[lngField]);
        let dataObj = { latlng: latlng };

        dataObj[valueField] = entry[valueField];
        this._max = Math.max(this._max, dataObj[valueField]);
        this._min = Math.min(this._min, dataObj[valueField]);

        if (entry.radius) {
          dataObj.radius = entry.radius;
        }
        this._data.push(dataObj);
        this._draw();
      }
    },

    _reset: function () {
      this._origin = this._map.layerPointToLatLng(new L.Point(0, 0));

      let size = this._map.getSize();
      if (this._width !== size.x || this._height !== size.y) {
        this._width = size.x;
        this._height = size.y;

        this._el.style.width = this._width + 'px';
        this._el.style.height = this._height + 'px';

        this._heatmap._renderer.setDimensions(this._width, this._height);
      }
      this._draw();
    },
  });

  HeatmapOverlay.CSS_TRANSFORM = (function () {
    let div = document.createElement('div');
    let props = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];

    for (const prop of props) {
      if (div.style[prop] !== undefined) {
        return prop;
      }
    }
    return props[0];
  })();

  exports.HeatmapOverlay = HeatmapOverlay;
}));
  