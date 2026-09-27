<template>
  <div class="relative">
    <div class="relative">
      <span
        class="absolute left-0 top-1/2 -translate-y-1/2 text-[#1E2A26]/30"
        :class="size === 'lg' ? 'left-5 text-lg' : 'left-3 text-sm'"
      >⌕</span>
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown.esc="$emit('update:modelValue', '')"
        type="text"
        :placeholder="placeholder"
        class="font-plex w-full bg-white border border-[#1E2A26]/10 focus:outline-none focus:ring-2 focus:ring-[#2F6F52]/40 focus:border-[#2F6F52] transition-all"
        :class="size === 'lg'
          ? 'pl-12 pr-5 py-4 text-base rounded-2xl shadow-sm'
          : 'pl-9 pr-9 py-2.5 text-sm rounded-xl w-56'"
      />
      <button
        v-if="modelValue"
        @click="$emit('update:modelValue', '')"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2A26]/30 hover:text-[#1E2A26] text-xs cursor-pointer"
        aria-label="Clear search"
      >
        ✕
      </button>
    </div>

    <div
      v-if="modelValue.trim().length >= 2"
      class="absolute z-40 mt-2 w-full min-w-[280px] bg-white rounded-2xl border border-[#1E2A26]/10 shadow-xl overflow-hidden max-h-80 overflow-y-auto"
    >
      <button
        v-for="r in results"
        :key="r.type + r.item.id"
        @click="$emit('select', r)"
        class="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1E2A26]/[0.04] transition-colors text-left cursor-pointer"
      >
        <span
          class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
          :style="{ backgroundColor: TYPE_ACCENT[r.type] }"
        >
          {{ TYPE_INITIAL[r.type] }}
        </span>
        <span class="min-w-0">
          <span class="block font-plex text-sm font-semibold text-[#1E2A26] truncate">{{ r.item.name }}</span>
          <span class="block font-plex text-[11px] text-[#1E2A26]/45 truncate">
            {{ TYPE_LABEL[r.type] }}<template v-if="r.subtitle"> · {{ r.subtitle }}</template>
          </span>
        </span>
      </button>
      <p v-if="results.length === 0" class="px-4 py-6 text-center font-plex text-xs text-[#1E2A26]/40">
        No location matches "{{ modelValue }}"
      </p>
    </div>
  </div>
</template>

<script setup>
import { TYPE_ACCENT, TYPE_INITIAL, TYPE_LABEL } from '../utils/locationMeta';

defineProps({
  modelValue: { type: String, default: '' },
  results: { type: Array, default: () => [] },
  size: { type: String, default: 'sm' }, // 'sm' | 'lg'
  placeholder: { type: String, default: 'Search any division, district, upazila, or union…' },
});

defineEmits(['update:modelValue', 'select']);
</script>