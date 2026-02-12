const MAPBOX_JS_URL = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
const MAPBOX_CSS_URL = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
const MAPBOX_PROMISE_KEY = '__stockistMapboxPromise';

function loadMapboxCss() {
  if (document.querySelector('link[data-mapbox-gl-css]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = MAPBOX_CSS_URL;
  link.dataset.mapboxGlCss = 'true';
  document.head.appendChild(link);
}

function loadMapbox() {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);
  if (window[MAPBOX_PROMISE_KEY]) return window[MAPBOX_PROMISE_KEY];
  loadMapboxCss();
  window[MAPBOX_PROMISE_KEY] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MAPBOX_JS_URL;
    script.async = true;
    script.onload = () => resolve(window.mapboxgl);
    script.onerror = () => reject(new Error('Failed to load Mapbox GL JS'));
    document.head.appendChild(script);
  });
  return window[MAPBOX_PROMISE_KEY];
}

function parseCenter(value) {
  if (!value) return null;
  const parts = value
    .split(',')
    .map((part) => Number.parseFloat(part.trim()))
    .filter((part) => Number.isFinite(part));
  if (parts.length < 2) return null;
  return [parts[1], parts[0]];
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineDistance(origin, target) {
  const R = 6371;
  const dLat = toRadians(target[1] - origin[1]);
  const dLng = toRadians(target[0] - origin[0]);
  const lat1 = toRadians(origin[1]);
  const lat2 = toRadians(target[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class StockistMapbox extends HTMLElement {
  connectedCallback() {
    if (this.dataset.stockistMapboxInitialized === 'true') return;
    this.dataset.stockistMapboxInitialized = 'true';

    this.token = this.dataset.mapboxToken || '';
    this.mapStyle = this.dataset.mapStyle || 'mapbox://styles/mapbox/light-v11';
    this.defaultCenter = parseCenter(this.dataset.defaultCenter) || [0, 0];
    this.defaultZoom = Number.parseInt(this.dataset.defaultZoom || '6', 10);
    this.sortByDistance = this.dataset.sortByDistance === 'true';
    this.showDistance = this.dataset.showDistance === 'true';
    this.emptyText = this.dataset.emptyText || 'Add stockists to show them here.';

    this.resultsEl = this.querySelector('[data-results]');
    this.mapEl = this.querySelector('[data-map]');
    this.searchForm = this.querySelector('[data-search]');
    this.searchInput = this.querySelector('[data-search-input]');
    this.geoButton = this.querySelector('[data-geolocate]');

    this.locations = this.loadLocations();
    this.activeId = null;
    this.origin = null;
    this.markers = new Map();

    this.renderList();
    this.setupSearch();
    this.setupGeolocate();

    if (!this.token) {
      this.renderMapPlaceholder('Mapbox access token required.');
      return;
    }

    if (this.mapEl) {
      loadMapbox()
        .then((mapboxgl) => this.initMap(mapboxgl))
        .catch(() => {
          this.renderMapPlaceholder('Unable to load the map.');
        });
    }
  }

  loadLocations() {
    const dataScript = this.querySelector('[data-stockist-data]');
    if (!dataScript) return [];
    try {
      const raw = JSON.parse(dataScript.textContent || '[]');
      return raw.map((location, index) => {
        const lat = toNumber(location.lat);
        const lng = toNumber(location.lng);
        return {
          id: location.id || `stockist-${index}`,
          name: location.name || 'Stockist',
          address_line_1: location.address_line_1 || '',
          address_line_2: location.address_line_2 || '',
          city: location.city || '',
          region: location.region || '',
          postal_code: location.postal_code || '',
          country: location.country || '',
          phone: location.phone || '',
          website: location.website || '',
          notes: location.notes || '',
          lat,
          lng,
          distanceKm: null,
          order: index
        };
      });
    } catch (error) {
      return [];
    }
  }

  renderMapPlaceholder(text) {
    if (!this.mapEl) return;
    this.mapEl.innerHTML = '';
    const placeholder = document.createElement('div');
    placeholder.className = 'stockist-mapbox__placeholder';
    placeholder.textContent = text;
    this.mapEl.appendChild(placeholder);
  }

  setupSearch() {
    if (!this.searchForm || !this.searchInput) return;
    this.searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = this.searchInput.value.trim();
      if (!query) return;
      this.searchLocation(query);
    });
  }

  setupGeolocate() {
    if (!this.geoButton) return;
    this.geoButton.addEventListener('click', () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude];
          this.setOrigin(coords);
          if (this.map) {
            this.map.flyTo({ center: coords, zoom: Math.max(this.map.getZoom(), 10) });
            this.addSearchMarker(coords);
          }
        },
        () => {}
      );
    });
  }

  async searchLocation(query) {
    if (!this.token) return;
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
    url.searchParams.set('access_token', this.token);
    url.searchParams.set('limit', '1');
    const response = await fetch(url.toString());
    if (!response.ok) return;
    const data = await response.json();
    if (!data.features || !data.features.length) return;
    const [lng, lat] = data.features[0].center;
    const coords = [lng, lat];
    this.setOrigin(coords);
    if (this.map) {
      this.map.flyTo({ center: coords, zoom: Math.max(this.map.getZoom(), 10) });
      this.addSearchMarker(coords);
    }
  }

  setOrigin(coords) {
    this.origin = coords;
    if (!coords) {
      this.locations.forEach((location) => {
        location.distanceKm = null;
      });
      this.renderList();
      return;
    }
    this.locations.forEach((location) => {
      if (location.lat === null || location.lng === null) {
        location.distanceKm = null;
        return;
      }
      location.distanceKm = haversineDistance(coords, [location.lng, location.lat]);
    });
    this.renderList();
  }

  getSortedLocations() {
    const list = [...this.locations];
    if (this.sortByDistance && this.origin) {
      list.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
      return list;
    }
    list.sort((a, b) => a.order - b.order);
    return list;
  }

  renderList() {
    if (!this.resultsEl) return;
    this.resultsEl.innerHTML = '';
    const locations = this.getSortedLocations();
    if (!locations.length) {
      const placeholder = document.createElement('div');
      placeholder.className = 'stockist-mapbox__placeholder';
      placeholder.textContent = this.emptyText;
      this.resultsEl.appendChild(placeholder);
      return;
    }
    const fragment = document.createDocumentFragment();
    locations.forEach((location) => {
      const item = document.createElement('div');
      item.className = 'stockist-mapbox__item';
      if (this.activeId === location.id) item.classList.add('is-active');

      const button = document.createElement('button');
      button.className = 'stockist-mapbox__item-button';
      button.type = 'button';
      button.addEventListener('click', () => this.focusLocation(location));

      const title = document.createElement('div');
      title.className = 'stockist-mapbox__item-title';
      title.textContent = location.name;
      button.appendChild(title);

      const meta = document.createElement('div');
      meta.className = 'stockist-mapbox__item-meta';
      const addressLines = [];
      if (location.address_line_1) addressLines.push(location.address_line_1);
      if (location.address_line_2) addressLines.push(location.address_line_2);
      const locality = [location.city, location.region, location.postal_code]
        .filter(Boolean)
        .join(' ');
      if (locality) addressLines.push(locality);
      if (location.country) addressLines.push(location.country);

      addressLines.forEach((line) => {
        const lineEl = document.createElement('div');
        lineEl.textContent = line;
        meta.appendChild(lineEl);
      });

      if (location.phone) {
        const phoneEl = document.createElement('a');
        phoneEl.href = `tel:${location.phone}`;
        phoneEl.textContent = location.phone;
        meta.appendChild(phoneEl);
      }

      if (location.website) {
        const websiteEl = document.createElement('a');
        websiteEl.href = location.website;
        websiteEl.target = '_blank';
        websiteEl.rel = 'noopener';
        websiteEl.textContent = location.website.replace(/^https?:\/\//, '');
        meta.appendChild(websiteEl);
      }

      if (location.notes) {
        const notesEl = document.createElement('div');
        notesEl.textContent = location.notes;
        meta.appendChild(notesEl);
      }

      button.appendChild(meta);

      if (this.showDistance && location.distanceKm !== null) {
        const distance = document.createElement('div');
        distance.className = 'stockist-mapbox__item-distance';
        distance.textContent = `${location.distanceKm.toFixed(1)} km`;
        button.appendChild(distance);
      }

      item.appendChild(button);
      fragment.appendChild(item);
    });
    this.resultsEl.appendChild(fragment);
  }

  focusLocation(location) {
    if (!location) return;
    this.activeId = location.id;
    this.setActiveMarker(location.id);
    this.renderList();
    if (this.map && location.lat !== null && location.lng !== null) {
      this.map.flyTo({
        center: [location.lng, location.lat],
        zoom: Math.max(this.map.getZoom(), 12)
      });
    }
  }

  setActiveMarker(id) {
    this.markers.forEach((marker, markerId) => {
      marker.getElement().classList.toggle('is-active', markerId === id);
    });
  }

  addSearchMarker(coords) {
    if (!this.map || !coords) return;
    if (!this.searchMarker) {
      this.searchMarker = new window.mapboxgl.Marker().setLngLat(coords).addTo(this.map);
      return;
    }
    this.searchMarker.setLngLat(coords);
  }

  initMap(mapboxgl) {
    mapboxgl.accessToken = this.token;
    const mapCenter = this.defaultCenter;

    this.map = new mapboxgl.Map({
      container: this.mapEl,
      style: this.mapStyle,
      center: mapCenter,
      zoom: this.defaultZoom
    });

    const locationsWithCoords = this.locations.filter((location) => location.lat !== null && location.lng !== null);
    locationsWithCoords.forEach((location) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'stockist-mapbox__marker';
      markerEl.addEventListener('click', () => this.focusLocation(location));
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([location.lng, location.lat])
        .addTo(this.map);
      this.markers.set(location.id, marker);
    });

    this.map.on('load', () => {
      this.map.resize();
    });

    const details = this.closest('details');
    if (details) {
      details.addEventListener('toggle', () => {
        if (details.open && this.map) {
          this.map.resize();
        }
      });
    }
  }
}

if (!customElements.get('stockist-mapbox')) {
  customElements.define('stockist-mapbox', StockistMapbox);
}
