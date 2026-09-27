<template>
  <div
    class="card-in group bg-[#FFFEFA] rounded-2xl p-6 border border-[#1E2A26]/10 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(30,42,38,0.35)]"
    :style="{ animationDelay: `${Math.min(index, 10) * 45}ms`, '--accent': accent }"
  >
    <!-- Color rule: a deterministic accent per location, doubling as a quiet index -->
    <span class="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--accent)] opacity-70 group-hover:opacity-100 transition-opacity"></span>

    <div class="relative z-10 pl-2">
      <div class="mb-5 flex justify-between items-start gap-3">
        <div>
          <h3 class="font-display text-xl font-semibold text-[#1E2A26] tracking-tight leading-snug">
            {{ item.name }}
          </h3>
          <span
            class="font-bn inline-flex items-center justify-center mt-2 text-[13px] text-[#1E2A26]/80 border border-dashed rounded-full px-3 py-1"
            :style="{ borderColor: accent + '80' }"
          >
            {{ item.bn_name }}
          </span>
        </div>
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 text-white"
          :style="{ backgroundColor: accent }"
        >
          {{ typeInitial }}
        </div>
      </div>

      <div v-if="item.url" class="mb-5 flex items-center gap-2.5 text-xs bg-[#1E2A26]/[0.04] p-3 rounded-xl border border-[#1E2A26]/[0.06]">
        <span class="text-[#1E2A26]/50">🔗</span>
        <a
          :href="'https://' + item.url"
          target="_blank"
          class="font-plex text-[#1E2A26]/70 font-medium hover:text-[var(--accent)] hover:underline truncate transition-colors"
        >
          {{ item.url }}
        </a>
      </div>

      <button
        @click="openMapModal"
        class="w-full py-3 px-4 text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mb-5"
        :style="{ backgroundColor: '#1E2A26' }"
        @mouseenter="$event.currentTarget.style.backgroundColor = accent"
        @mouseleave="$event.currentTarget.style.backgroundColor = '#1E2A26'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span>Locate on Map</span>
      </button>
    </div>

    <button
      v-if="actionText"
      @click="$emit('click')"
      class="w-full bg-[#1E2A26]/[0.05] hover:bg-[var(--accent)] hover:text-white text-[#1E2A26] text-xs font-semibold py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 relative z-10"
    >
      <span>{{ actionText }}</span>
      <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>

    <!-- Map Modal — teleported to <body> so a card's own overflow/stacking
         context can never clip the overlay or hide its close button -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[999] flex items-center justify-center bg-[#1E2A26]/60 backdrop-blur-sm p-4 animate-fade-in"
        @click.self="isModalOpen = false"
        @keydown.esc="isModalOpen = false"
      >
        <div class="bg-[#FFFEFA] rounded-[1.75rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col border border-[#1E2A26]/10">
          <div class="px-7 py-5 flex justify-between items-center text-white" :style="{ backgroundColor: '#1E2A26' }">
            <div>
              <h3 class="font-display text-lg font-semibold">{{ item.name }} — {{ typeLabel }} Map</h3>
              <p class="font-bn text-xs mt-0.5" :style="{ color: accent }">{{ item.bn_name }}</p>
            </div>
            <button
              @click="isModalOpen = false"
              class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer text-sm"
              aria-label="Close map"
            >
              ✕
            </button>
          </div>

          <div class="h-[420px] w-full relative">
            <!-- Resolving state: replaces the old hardcoded map while we locate this exact place -->
            <div v-if="status === 'loading'" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1E2A26]/[0.03]">
              <div class="w-8 h-8 border-[3px] rounded-full animate-spin" :style="{ borderColor: accent + '40', borderTopColor: accent }"></div>
              <p class="font-plex text-xs text-[#1E2A26]/60 font-medium">Locating {{ item.name }}…</p>
            </div>

            <l-map v-else-if="coords" :zoom="zoom" :center="coords" :key="cacheKey" style="height: 100%; width: 100%;">
              <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                layer-id="openstreetmap"
                attribution="&copy; OpenStreetMap contributors"
              ></l-tile-layer>
              <l-marker :lat-lng="coords">
                <l-popup>{{ item.name }} ({{ item.bn_name }})</l-popup>
              </l-marker>
            </l-map>
          </div>

          <div class="px-7 py-4 flex justify-between items-center border-t border-[#1E2A26]/10 bg-[#1E2A26]/[0.02]">
            <span v-if="status === 'approximate'" class="font-plex text-[11px] text-[#B23A3A] font-medium">
              Approximate area — exact boundary data isn't available for this level yet
            </span>
            <span v-else class="font-plex text-[11px] text-[#1E2A26]/40 font-medium">OpenStreetMap · Leaflet</span>
            <button
              @click="isModalOpen = false"
              class="text-white text-xs font-semibold py-2 px-5 rounded-xl transition-all cursor-pointer"
              :style="{ backgroundColor: accent }"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import { useGeoLocation } from '../composables/useGeoLocation';
import { TYPE_ACCENT, TYPE_INITIAL } from '../utils/locationMeta';

const props = defineProps({
  item: { type: Object, required: true },
  actionText: { type: String, default: '' },
  type: { type: String, required: true }, // 'division' | 'district' | 'upazila' | 'union'
  context: { type: Object, default: () => ({}) },
  index: { type: Number, default: 0 },
});

defineEmits(['click']);

// Color and initial are fixed per administrative tier (see locationMeta.js)
// rather than hashed per name, so the same color always means the same
// level of government everywhere in the app — cards, search, the legend.
const accent = computed(() => TYPE_ACCENT[props.type]);
const typeInitial = computed(() => TYPE_INITIAL[props.type]);
const typeLabel = computed(() => props.type.charAt(0).toUpperCase() + props.type.slice(1));
const cacheKey = computed(() => `${props.type}:${props.item.id}`);

const isModalOpen = ref(false);
const { coords, zoom, status, resolve } = useGeoLocation(props.item, props.type, props.context);

const openMapModal = async () => {
  isModalOpen.value = true;
  if (!coords.value) await resolve();
  await nextTick();
  window.dispatchEvent(new Event('resize'));
};

// Esc closes the modal no matter where focus is, since the teleported
// overlay is no longer nested inside this card's own keydown handlers.
function handleEscKey(e) {
  if (e.key === 'Escape') isModalOpen.value = false;
}
watch(isModalOpen, (open) => {
  if (open) window.addEventListener('keydown', handleEscKey);
  else window.removeEventListener('keydown', handleEscKey);
});
onBeforeUnmount(() => window.removeEventListener('keydown', handleEscKey));
</script>

<style>
@keyframes cardIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.card-in {
  animation: cardIn 0.4s ease-out both;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .card-in { animation: none; }
}
</style>