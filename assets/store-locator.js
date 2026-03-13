(function () {
  const initialized = new WeakSet();

  document.addEventListener('DOMContentLoaded', () => initAll(document));
  document.addEventListener('shopify:section:load', (event) => initAll(event.target));

  function initAll(root) {
    root.querySelectorAll('[data-store-locator]').forEach((node) => {
      if (initialized.has(node)) return;
      initialized.add(node);
      initLocator(node);
    });
  }

  async function initLocator(root) {
    const config = readConfig(root);
    const refs = {
      search: root.querySelector('[data-store-locator-search]'),
      count: root.querySelector('[data-store-locator-count]'),
      filters: root.querySelector('[data-store-locator-filters]'),
      status: root.querySelector('[data-store-locator-status]'),
      results: root.querySelector('[data-store-locator-results]'),
      map: root.querySelector('[data-store-locator-map]'),
    };

    const state = {
      locations: [],
      filteredLocations: [],
      activeRegion: 'All',
      activeLocationId: null,
      markers: new Map(),
      searchTerm: '',
      map: null,
      popup: null,
    };

    refs.search?.addEventListener('input', (event) => {
      state.searchTerm = event.target.value.trim().toLowerCase();
      filterAndRender(state, refs, config);
    });

    refs.filters?.addEventListener('click', (event) => {
      const filterButton = event.target.closest('[data-region]');
      if (!filterButton) return;
      state.activeRegion = filterButton.dataset.region || 'All';
      renderRegionFilters(state, refs);
      filterAndRender(state, refs, config);
    });

    refs.results?.addEventListener('click', (event) => {
      const card = event.target.closest('[data-location-id]');
      if (!card) return;
      selectLocation(card.dataset.locationId, state, refs, { fly: true, scroll: false });
    });

    refs.results?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('[data-location-id]');
      if (!card) return;
      event.preventDefault();
      selectLocation(card.dataset.locationId, state, refs, { fly: true, scroll: false });
    });

    if (!config.sheetUrl) {
      renderStatus(
        refs,
        config.designMode ? config.sheetHelpText || config.configText : config.configText
      );
      return;
    }

    renderStatus(refs, config.loadingText);

    try {
      const csvText = await fetchCsv(config.sheetUrl);
      const rows = parseCsv(csvText);
      const locations = normalizeLocations(rows);

      if (!locations.length) {
        throw new Error(config.emptyText);
      }

      state.locations = locations;
      state.filteredLocations = locations;

      if (config.enableMap && refs.map && config.mapboxToken && window.mapboxgl) {
        state.map = createMap(refs.map, config);
        state.popup = new window.mapboxgl.Popup({
          closeButton: false,
          offset: 16,
        });
        createMarkers(state, refs);
      }

      renderRegionFilters(state, refs);
      filterAndRender(state, refs, config);
    } catch (error) {
      console.error('Store locator failed to load', error);
      renderStatus(refs, config.errorText);
    }
  }

  function readConfig(root) {
    return {
      sheetUrl: resolveSheetUrl(root.dataset.sheetUrl || ''),
      mapboxToken: root.dataset.mapboxToken || '',
      mapStyle: root.dataset.mapStyle || 'mapbox://styles/mapbox/light-v11',
      enableMap: root.dataset.enableMap === 'true',
      defaultLat: Number.parseFloat(root.dataset.defaultLat || '-41.2865'),
      defaultLng: Number.parseFloat(root.dataset.defaultLng || '174.7762'),
      defaultZoom: Number.parseFloat(root.dataset.defaultZoom || '4.6'),
      designMode: root.dataset.designMode === 'true',
      loadingText: root.dataset.loadingText || 'Loading stockists...',
      emptyText: root.dataset.emptyText || 'No stockists match that search yet.',
      errorText:
        root.dataset.errorText || 'We could not load the stockist data right now.',
      configText:
        root.dataset.configText ||
        'Store data is being updated. Please shop online or contact us in the meantime.',
      sheetHelpText:
        root.dataset.sheetHelpText ||
        'Add a public Google Sheet or CSV URL in the section settings to load stockists.',
    };
  }

  function resolveSheetUrl(rawUrl) {
    const url = rawUrl.trim();
    if (!url) return '';

    const match = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return url;

    const gidMatch = url.match(/[?#&]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
  }

  async function fetchCsv(url) {
    const response = await fetch(url, { credentials: 'omit' });

    if (!response.ok) {
      throw new Error(`CSV request failed with ${response.status}`);
    }

    return response.text();
  }

  function parseCsv(text) {
    const source = text.replace(/^\uFEFF/, '');
    const rows = [];
    let cell = '';
    let row = [];
    let inQuotes = false;

    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      const nextCharacter = source[index + 1];

      if (character === '"') {
        if (inQuotes && nextCharacter === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (character === ',' && !inQuotes) {
        row.push(cell);
        cell = '';
      } else if ((character === '\n' || character === '\r') && !inQuotes) {
        if (character === '\r' && nextCharacter === '\n') {
          index += 1;
        }

        row.push(cell);
        if (row.some((value) => value.trim() !== '')) {
          rows.push(row);
        }
        row = [];
        cell = '';
      } else {
        cell += character;
      }
    }

    row.push(cell);
    if (row.some((value) => value.trim() !== '')) {
      rows.push(row);
    }

    if (!rows.length) return [];

    const headers = rows[0].map(normalizeHeader);
    return rows.slice(1).map((values) => {
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = (values[index] || '').trim();
      });
      return rowObject;
    });
  }

  function normalizeHeader(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s-]+/g, '_');
  }

  function normalizeLocations(rows) {
    const locations = rows
      .map((row, index) => buildLocation(row, index))
      .filter(Boolean)
      .sort(compareLocations);

    return locations;
  }

  function buildLocation(row, index) {
    const latitude = parseCoordinate(findValue(row, [
      'latitude',
      'lat',
      'y',
      'map_latitude',
    ]));
    const longitude = parseCoordinate(findValue(row, [
      'longitude',
      'lng',
      'lon',
      'long',
      'x',
      'map_longitude',
    ]));

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }

    const name = findValue(row, ['name', 'store', 'stockist', 'location']);
    if (!name) return null;

    const address = findValue(row, ['address', 'street', 'street_address']);
    const suburb = findValue(row, ['suburb', 'neighbourhood']);
    const city = findValue(row, ['city', 'town']);
    const region = findValue(row, ['region', 'state', 'province']) || city;
    const website = sanitizeUrl(findValue(row, ['website', 'url', 'link']));
    const notes = findValue(row, ['notes', 'stock_note', 'stock_notes', 'range', 'details']);
    const postcode = findValue(row, ['postcode', 'zip']);
    const country = findValue(row, ['country']) || 'New Zealand';
    const featured = toBoolean(findValue(row, ['featured', 'is_featured']));
    const sort = Number.parseInt(findValue(row, ['sort', 'order', 'priority']) || '', 10);
    const retailerType = findValue(row, ['type', 'retailer_type', 'category']);

    const addressParts = [address, suburb, city, region, postcode, country].filter(Boolean);

    return {
      id: `location-${index + 1}`,
      name,
      address,
      suburb,
      city,
      region,
      country,
      postcode,
      website,
      notes,
      featured,
      retailerType,
      sort: Number.isNaN(sort) ? Number.MAX_SAFE_INTEGER : sort,
      latitude,
      longitude,
      directionsUrl: buildDirectionsUrl(addressParts.join(', '), latitude, longitude),
      searchIndex: [name, address, suburb, city, region, country, notes, retailerType]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
      addressLabel: addressParts.join(', '),
    };
  }

  function findValue(row, aliases) {
    for (const alias of aliases) {
      if (row[alias]) return row[alias];
    }
    return '';
  }

  function parseCoordinate(value) {
    const source = String(value || '').trim();
    if (!source) return Number.NaN;
    return Number.parseFloat(source.replace(',', '.'));
  }

  function sanitizeUrl(value) {
    const source = String(value || '').trim();
    if (!source) return '';
    if (/^https?:\/\//i.test(source)) return source;
    return `https://${source}`;
  }

  function toBoolean(value) {
    return /^(1|true|yes|y)$/i.test(String(value || '').trim());
  }

  function compareLocations(left, right) {
    if (left.sort !== right.sort) return left.sort - right.sort;
    if (left.featured !== right.featured) return Number(right.featured) - Number(left.featured);
    if (left.region !== right.region) return left.region.localeCompare(right.region);
    return left.name.localeCompare(right.name);
  }

  function buildDirectionsUrl(addressLabel, latitude, longitude) {
    const query = addressLabel || `${latitude},${longitude}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function renderRegionFilters(state, refs) {
    if (!refs.filters) return;

    const regions = Array.from(
      new Set(state.locations.map((location) => location.region || location.city).filter(Boolean))
    );

    if (!regions.length) {
      refs.filters.hidden = true;
      refs.filters.innerHTML = '';
      return;
    }

    const buttons = ['All', ...regions]
      .map((region) => {
        const isActive = state.activeRegion === region;
        return `
          <button
            type="button"
            class="store-locator-widget__filter${isActive ? ' is-active' : ''}"
            data-region="${escapeHtml(region)}"
            aria-pressed="${isActive}"
          >
            ${escapeHtml(region)}
          </button>
        `;
      })
      .join('');

    refs.filters.hidden = false;
    refs.filters.innerHTML = buttons;
  }

  function filterAndRender(state, refs, config) {
    const filteredLocations = state.locations.filter((location) => {
      const matchesRegion =
        state.activeRegion === 'All' || (location.region || location.city) === state.activeRegion;
      const matchesSearch =
        !state.searchTerm || location.searchIndex.includes(state.searchTerm);
      return matchesRegion && matchesSearch;
    });

    state.filteredLocations = filteredLocations;

    if (!filteredLocations.length) {
      refs.count.textContent = config.emptyText;
      renderStatus(refs, config.emptyText);
      refs.results.innerHTML = '';
      updateMarkers(state, []);
      return;
    }

    refs.status.textContent = '';
    refs.count.textContent = `${filteredLocations.length} stockist${filteredLocations.length === 1 ? '' : 's'}`;
    refs.results.innerHTML = filteredLocations.map((location) => buildCardMarkup(location)).join('');

    if (!filteredLocations.some((location) => location.id === state.activeLocationId)) {
      state.activeLocationId = filteredLocations[0].id;
    }

    updateActiveCard(refs, state.activeLocationId);
    updateMarkers(state, filteredLocations);
    fitMapToResults(state, filteredLocations);
  }

  function buildCardMarkup(location) {
    const metaBadges = [location.city, location.region, location.retailerType]
      .filter(Boolean)
      .slice(0, 3)
      .map((value) => `<span class="store-locator-widget__badge">${escapeHtml(value)}</span>`)
      .join('');

    const actions = [
      location.website
        ? `<a class="store-locator-widget__card-link" href="${escapeHtml(location.website)}" target="_blank" rel="noopener">Website</a>`
        : '',
      `<a class="store-locator-widget__card-link" href="${escapeHtml(location.directionsUrl)}" target="_blank" rel="noopener">Directions</a>`,
    ]
      .filter(Boolean)
      .join('');

    return `
      <article
        class="store-locator-widget__card"
        tabindex="0"
        data-location-id="${escapeHtml(location.id)}"
      >
        <div class="store-locator-widget__card-top">
          <h3 class="store-locator-widget__card-name">${escapeHtml(location.name)}</h3>
          ${location.featured ? '<span class="store-locator-widget__badge">Featured</span>' : ''}
        </div>
        ${metaBadges ? `<div class="store-locator-widget__card-meta">${metaBadges}</div>` : ''}
        ${location.addressLabel ? `<p class="store-locator-widget__card-address">${escapeHtml(location.addressLabel)}</p>` : ''}
        ${location.notes ? `<p class="store-locator-widget__card-notes">${escapeHtml(location.notes)}</p>` : ''}
        <div class="store-locator-widget__card-actions">${actions}</div>
      </article>
    `;
  }

  function renderStatus(refs, text) {
    if (!refs.status) return;
    refs.status.textContent = text || '';
  }

  function createMap(container, config) {
    window.mapboxgl.accessToken = config.mapboxToken;
    return new window.mapboxgl.Map({
      container,
      style: config.mapStyle,
      center: [config.defaultLng, config.defaultLat],
      zoom: config.defaultZoom,
      cooperativeGestures: true,
    });
  }

  function createMarkers(state, refs) {
    if (!state.map) return;

    state.locations.forEach((location) => {
      const markerElement = document.createElement('button');
      markerElement.type = 'button';
      markerElement.className = 'store-locator-widget__marker';
      markerElement.setAttribute('aria-label', `View ${location.name} on map`);

      markerElement.addEventListener('click', () => {
        selectLocation(location.id, state, refs, { fly: true, scroll: true });
      });

      const marker = new window.mapboxgl.Marker({ element: markerElement })
        .setLngLat([location.longitude, location.latitude])
        .addTo(state.map);

      state.markers.set(location.id, { marker, element: markerElement, location });
    });
  }

  function updateMarkers(state, filteredLocations) {
    if (!state.markers.size) return;

    const visibleIds = new Set(filteredLocations.map((location) => location.id));
    state.markers.forEach(({ marker, element, location }, locationId) => {
      const markerNode = marker.getElement();
      markerNode.style.display = visibleIds.has(locationId) ? '' : 'none';
      element.classList.toggle('is-active', locationId === state.activeLocationId);

      if (locationId === state.activeLocationId && state.popup && state.map) {
        state.popup
          .setLngLat([location.longitude, location.latitude])
          .setHTML(buildPopupMarkup(location))
          .addTo(state.map);
      }
    });
  }

  function fitMapToResults(state, filteredLocations) {
    if (!state.map || !filteredLocations.length) return;

    if (filteredLocations.length === 1) {
      const onlyLocation = filteredLocations[0];
      state.map.flyTo({
        center: [onlyLocation.longitude, onlyLocation.latitude],
        zoom: 12,
      });
      return;
    }

    const bounds = new window.mapboxgl.LngLatBounds();
    filteredLocations.forEach((location) => {
      bounds.extend([location.longitude, location.latitude]);
    });

    state.map.fitBounds(bounds, {
      padding: 56,
      maxZoom: 11.5,
      duration: 700,
    });
  }

  function selectLocation(locationId, state, refs, options) {
    state.activeLocationId = locationId;
    updateActiveCard(refs, locationId);
    updateMarkers(state, state.filteredLocations);

    const markerRecord = state.markers.get(locationId);
    if (options.fly && markerRecord && state.map) {
      state.map.flyTo({
        center: [markerRecord.location.longitude, markerRecord.location.latitude],
        zoom: 13,
      });
    }

    if (options.scroll) {
      const activeCard = refs.results.querySelector(`[data-location-id="${locationId}"]`);
      activeCard?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function updateActiveCard(refs, locationId) {
    refs.results
      .querySelectorAll('[data-location-id]')
      .forEach((card) => card.classList.toggle('is-active', card.dataset.locationId === locationId));
  }

  function buildPopupMarkup(location) {
    return `
      <div class="store-locator-widget__popup">
        <strong>${escapeHtml(location.name)}</strong>
        ${location.addressLabel ? `<p>${escapeHtml(location.addressLabel)}</p>` : ''}
        ${location.notes ? `<p>${escapeHtml(location.notes)}</p>` : ''}
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
