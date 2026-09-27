import { ref, computed } from 'vue';

// The source dataset only ships surveyed lat/long down to the *district*
// level (District Commissioner's office coordinates). Divisions, upazilas
// and unions have no coordinates in the raw JSON, which is why every map
// used to fall back to the same hardcoded Dhaka point. This file fixes that.

// Division headquarters coordinates — stable public data, so no need to
// hit the network for the 8 divisions.
const DIVISION_COORDS = {
  dhaka: [23.8103, 90.4125],
  chattogram: [22.3569, 91.7832],
  chittagong: [22.3569, 91.7832],
  khulna: [22.8456, 89.5403],
  rajshahi: [24.3745, 88.6042],
  barishal: [22.701, 90.3535],
  barisal: [22.701, 90.3535],
  sylhet: [24.8949, 91.8687],
  rangpur: [25.7439, 89.2752],
  mymensingh: [24.7471, 90.4203],
};

const ZOOM_BY_TYPE = { division: 8, district: 10, upazila: 12, union: 13 };

const CACHE_KEY = 'bd-geo-cache-v1';
const memoryCache = new Map();

(function loadDiskCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    Object.entries(JSON.parse(raw)).forEach(([k, v]) => memoryCache.set(k, v));
  } catch {
    /* corrupt or unavailable cache — start fresh */
  }
})();

function saveDiskCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(memoryCache)));
  } catch {
    /* storage unavailable — in-memory cache still works for this session */
  }
}

// Nominatim's usage policy caps anonymous lookups at ~1/second, so every
// geocode request funnels through this single queue.
let queue = Promise.resolve();
function queuedFetch(url) {
  const run = () =>
    fetch(url, { headers: { Accept: 'application/json' } }).then((r) =>
      r.ok ? r.json() : Promise.reject(new Error('geocode request failed'))
    );
  const result = queue.then(run, run);
  queue = result.catch(() => {}).then(() => new Promise((res) => setTimeout(res, 1100)));
  return result;
}

async function geocodeByName(query, cacheKey) {
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=bd&q=${encodeURIComponent(
    query
  )}`;
  const data = await queuedFetch(url);
  if (!Array.isArray(data) || !data.length) throw new Error('no match found');
  const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  memoryCache.set(cacheKey, coords);
  saveDiskCache();
  return coords;
}

/**
 * Resolves the best-known [lat, lng] for a location card and reports
 * whether the point is a surveyed/known exact location or an approximate
 * fallback (used when a name can't be geocoded).
 *
 * @param {object} item - the division/district/upazila/union row
 * @param {'division'|'district'|'upazila'|'union'} type
 * @param {{divisionName?: string, districtName?: string, upazilaName?: string, districtCoords?: [number, number]}} context
 */
export function useGeoLocation(item, type, context = {}) {
  const coords = ref(null);
  const status = ref('idle'); // idle | loading | exact | approximate | error
  const zoom = computed(() => ZOOM_BY_TYPE[type] ?? 9);

  async function resolve() {
    status.value = 'loading';

    if (type === 'district' && item.lat && item.long) {
      coords.value = [parseFloat(item.lat), parseFloat(item.long)];
      status.value = 'exact';
      return;
    }

    if (type === 'division') {
      const key = item.name.trim().toLowerCase();
      const known = DIVISION_COORDS[key];
      coords.value = known ?? [23.685, 90.3563];
      status.value = known ? 'exact' : 'approximate';
      return;
    }

    // Upazilas and unions carry no coordinates in the dataset — geocode
    // them by name, scoped to their parent district so the result lands
    // in the right place instead of matching a same-named village elsewhere.
    const cacheKey = `${type}:${item.id}`;
    const query =
      type === 'union'
        ? `${item.name} Union, ${context.upazilaName ?? ''}, ${context.districtName ?? ''}, Bangladesh`
        : `${item.name} Upazila, ${context.districtName ?? ''}, Bangladesh`;

    try {
      coords.value = await geocodeByName(query, cacheKey);
      status.value = 'exact';
    } catch {
      const fallback =
        context.districtCoords ??
        DIVISION_COORDS[context.divisionName?.trim().toLowerCase()] ??
        [23.685, 90.3563];
      coords.value = fallback;
      status.value = 'approximate';
    }
  }

  return { coords, zoom, status, resolve };
}