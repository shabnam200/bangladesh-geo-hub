<template>
  <div class="min-h-screen bg-[#EEF1E6] text-[#1E2A26] pb-20 selection:bg-[#2F6F52] selection:text-white survey-texture">

    <!-- ============================= LANDING ============================= -->
    <section v-if="showLanding" class="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
      <div class="w-14 h-14 rounded-full bg-[#1E2A26] flex items-center justify-center text-white font-display font-semibold text-xl mx-auto mb-8">
        বা
      </div>

      <h1 class="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
        Bangladesh, <span class="italic font-normal">down to the last union.</span>
      </h1>
      <p class="font-plex text-sm text-[#1E2A26]/55 font-medium mt-4 max-w-xl mx-auto">
        Every division, district, upazila and union — with its own map, not a copy-pasted one.
      </p>

      <svg viewBox="0 0 800 60" class="w-full h-14 my-10" preserveAspectRatio="none">
        <path
          ref="riverPathLanding"
          d="M0,32 C120,60 180,-8 300,28 C420,64 480,0 560,26 C660,54 720,6 800,28"
          fill="none"
          stroke="#2F6F52"
          stroke-width="2.5"
          stroke-linecap="round"
          class="river-draw"
        />
      </svg>

      <div class="max-w-lg mx-auto">
        <GlobalSearch
          v-model="searchQuery"
          :results="globalResults"
          size="lg"
          placeholder="Try “Sylhet”, “Bagerhat”, or any union…"
          @select="handleSelectResult"
        />
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-2xl mx-auto">
        <div
          v-for="s in statCards"
          :key="s.type"
          class="bg-white/70 border border-[#1E2A26]/10 rounded-2xl px-4 py-4"
        >
          <p class="font-display text-3xl font-semibold" :style="{ color: TYPE_ACCENT[s.type] }">
            {{ animatedStats[s.type] }}
          </p>
          <p class="font-plex text-xs text-[#1E2A26]/55 font-medium mt-1">{{ s.label }}</p>
        </div>
      </div>

      <button
        @click="enterExplorer"
        class="font-plex mt-10 bg-[#1E2A26] hover:bg-[#2F6F52] text-white text-sm font-semibold py-3.5 px-8 rounded-2xl transition-all cursor-pointer"
      >
        Start Exploring
      </button>
    </section>

    <!-- ============================= EXPLORER ============================= -->
    <template v-else>
      <header class="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div class="flex items-center gap-4 mb-6 cursor-pointer w-fit" @click="showLanding = true">
          <div class="w-12 h-12 rounded-full bg-[#1E2A26] flex items-center justify-center text-white font-display font-semibold text-lg">
            বা
          </div>
          <div>
            <h1 class="font-display text-2xl font-semibold tracking-tight">
              Bangladesh <span class="italic font-normal">Geographic Registry</span>
            </h1>
            <p class="font-plex text-xs text-[#1E2A26]/55 font-medium mt-0.5">
              Division → District → Upazila → Union, mapped to their real coordinates
            </p>
          </div>
        </div>

        <svg viewBox="0 0 800 36" class="w-full h-9 mb-6" preserveAspectRatio="none">
          <path
            ref="riverPath"
            d="M0,20 C120,40 180,-5 300,18 C420,40 480,0 560,16 C660,34 720,4 800,18"
            fill="none"
            stroke="#2F6F52"
            stroke-width="2"
            stroke-linecap="round"
            class="river-draw"
          />
        </svg>

        <div class="flex items-center gap-2 mb-4">
          <template v-for="(label, i) in stepLabels" :key="label">
            <button
              @click="jumpToStep(i)"
              :disabled="i > activeStepIndex"
              class="flex items-center gap-2 group"
              :class="i > activeStepIndex ? 'cursor-not-allowed' : 'cursor-pointer'"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold font-plex transition-colors"
                :class="i <= activeStepIndex ? 'bg-[#2F6F52] text-white' : 'bg-[#1E2A26]/10 text-[#1E2A26]/40'"
              >
                {{ i + 1 }}
              </span>
              <span
                class="font-plex text-xs font-semibold hidden sm:inline transition-colors"
                :class="i === activeStepIndex ? 'text-[#1E2A26]' : i < activeStepIndex ? 'text-[#1E2A26]/60 group-hover:text-[#2F6F52]' : 'text-[#1E2A26]/30'"
              >
                {{ label }}
              </span>
            </button>
            <span v-if="i < stepLabels.length - 1" class="flex-1 h-px" :class="i < activeStepIndex ? 'bg-[#2F6F52]/50' : 'bg-[#1E2A26]/10'"></span>
          </template>
        </div>

        <!-- Legend: what D / Z / U / P mean, right where people will wonder -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span v-for="t in ['division', 'district', 'upazila', 'union']" :key="t" class="flex items-center gap-1.5 font-plex text-[11px] text-[#1E2A26]/50">
            <span
              class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold text-white"
              :style="{ backgroundColor: TYPE_ACCENT[t] }"
            >{{ TYPE_INITIAL[t] }}</span>
            {{ TYPE_LABEL[t] }}
          </span>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-6 mt-4">

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 class="font-display text-xl font-semibold capitalize">
              {{ currentStep === 'divisions' ? 'All Divisions' : currentStep }}
            </h2>
            <p class="font-plex text-xs text-[#1E2A26]/50 font-medium mt-0.5">
              Showing {{ shownCount }} of {{ totalCount }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <GlobalSearch v-model="searchQuery" :results="globalResults" size="sm" @select="handleSelectResult" />
            <button
              v-if="currentStep !== 'divisions'"
              @click="goBackStep"
              class="font-plex bg-white hover:bg-[#1E2A26] hover:text-white text-[#1E2A26] text-xs font-semibold py-2.5 px-5 rounded-xl transition-all border border-[#1E2A26]/10 cursor-pointer whitespace-nowrap"
            >
              ← Back
            </button>
          </div>
        </div>

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="n in 6" :key="n" class="h-48 rounded-2xl bg-white/70 border border-[#1E2A26]/5 animate-pulse"></div>
        </div>

        <div v-else :key="currentStep">
          <section v-if="currentStep === 'divisions'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LocationCard
              v-for="(item, i) in visibleDivisions"
              :key="item.id"
              :item="item"
              :index="i"
              type="division"
              actionText="View Districts"
              @click="selectDivision(item)"
            />
          </section>

          <section v-else-if="currentStep === 'districts'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LocationCard
              v-for="(item, i) in visibleDistricts"
              :key="item.id"
              :item="item"
              :index="i"
              type="district"
              actionText="View Upazilas"
              @click="selectDistrict(item)"
            />
          </section>

          <section v-else-if="currentStep === 'upazilas'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LocationCard
              v-for="(item, i) in visibleUpazilas"
              :key="item.id"
              :item="item"
              :index="i"
              type="upazila"
              :context="upazilaContext"
              actionText="View Unions"
              @click="selectUpazila(item)"
            />
          </section>

          <section v-else-if="currentStep === 'unions'">
            <div v-if="visibleUnions.length === 0" class="bg-white border border-[#1E2A26]/10 rounded-2xl p-16 text-center text-[#1E2A26]/40 text-sm font-plex font-medium">
              No unions match here.
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LocationCard
                v-for="(item, i) in visibleUnions"
                :key="item.id"
                :item="item"
                :index="i"
                type="union"
                :context="unionContext"
              />
            </div>
          </section>
        </div>

      </main>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import LocationCard from './components/LocationCard.vue';
import GlobalSearch from './components/GlobalSearch.vue';
import { TYPE_ACCENT, TYPE_INITIAL, TYPE_LABEL } from './utils/locationMeta';

const showLanding = ref(true);
const currentStep = ref('divisions');
const loading = ref(true);
const searchQuery = ref('');
const riverPath = ref(null);
const riverPathLanding = ref(null);

const divisionsData = ref([]);
const districtsData = ref([]);
const upazilasData = ref([]);
const unionsData = ref([]);

const selectedDivision = ref(null);
const selectedDistrict = ref(null);
const selectedUpazila = ref(null);

const stepLabels = ['Divisions', 'Districts', 'Upazilas', 'Unions'];
const activeStepIndex = computed(() => stepLabels.map((s) => s.toLowerCase()).indexOf(currentStep.value));

const statCards = [
  { type: 'division', label: 'Divisions' },
  { type: 'district', label: 'Districts' },
  { type: 'upazila', label: 'Upazilas' },
  { type: 'union', label: 'Unions' },
];
const animatedStats = ref({ division: 0, district: 0, upazila: 0, union: 0 });

function animateStats() {
  const targets = {
    division: divisionsData.value.length,
    district: districtsData.value.length,
    upazila: upazilasData.value.length,
    union: unionsData.value.length,
  };
  const duration = 900;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    for (const k in targets) animatedStats.value[k] = Math.round(targets[k] * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

onMounted(async () => {
  try {
    const baseUrl = 'https://raw.githubusercontent.com/nuhil/bangladesh-geocode/refs/heads/master';
    const [divRes, disRes, upRes, unRes] = await Promise.all([
      fetch(`${baseUrl}/divisions/divisions.json`),
      fetch(`${baseUrl}/districts/districts.json`),
      fetch(`${baseUrl}/upazilas/upazilas.json`),
      fetch(`${baseUrl}/unions/unions.json`),
    ]);

    const extractData = (json) => {
      if (Array.isArray(json)) {
        const tableObj = json.find((item) => item.data && Array.isArray(item.data));
        if (tableObj) return tableObj.data;
        return json;
      }
      return json;
    };

    divisionsData.value = extractData(await divRes.json());
    districtsData.value = extractData(await disRes.json());
    upazilasData.value = extractData(await upRes.json());
    unionsData.value = extractData(await unRes.json());
  } catch (error) {
    console.error('Error fetching datasets:', error);
  } finally {
    loading.value = false;
    animateStats();
    requestAnimationFrame(() => {
      riverPathLanding.value?.classList.add('run');
      riverPath.value?.classList.add('run');
    });
  }
});

watch(currentStep, () => {
  searchQuery.value = '';
});

function enterExplorer() {
  showLanding.value = false;
  requestAnimationFrame(() => riverPath.value?.classList.add('run'));
}

const filteredDistricts = computed(() => {
  if (!selectedDivision.value) return [];
  return districtsData.value.filter((d) => d.division_id == selectedDivision.value.id);
});
const filteredUpazilas = computed(() => {
  if (!selectedDistrict.value) return [];
  return upazilasData.value.filter((u) => u.district_id == selectedDistrict.value.id);
});
const filteredUnions = computed(() => {
  if (!selectedUpazila.value) return [];
  return unionsData.value.filter((un) => un.upazilla_id == selectedUpazila.value.id);
});

function bySearch(list) {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((i) => i.name?.toLowerCase().includes(q) || i.bn_name?.includes(searchQuery.value.trim()));
}

const visibleDivisions = computed(() => bySearch(divisionsData.value));
const visibleDistricts = computed(() => bySearch(filteredDistricts.value));
const visibleUpazilas = computed(() => bySearch(filteredUpazilas.value));
const visibleUnions = computed(() => bySearch(filteredUnions.value));

const totalCount = computed(
  () =>
    ({ divisions: divisionsData.value, districts: filteredDistricts.value, upazilas: filteredUpazilas.value, unions: filteredUnions.value }[
      currentStep.value
    ]?.length ?? 0)
);
const shownCount = computed(
  () =>
    ({ divisions: visibleDivisions.value, districts: visibleDistricts.value, upazilas: visibleUpazilas.value, unions: visibleUnions.value }[
      currentStep.value
    ]?.length ?? 0)
);

const upazilaContext = computed(() => ({
  divisionName: selectedDivision.value?.name,
  districtName: selectedDistrict.value?.name,
  districtCoords:
    selectedDistrict.value?.lat && selectedDistrict.value?.long
      ? [parseFloat(selectedDistrict.value.lat), parseFloat(selectedDistrict.value.long)]
      : null,
}));
const unionContext = computed(() => ({
  ...upazilaContext.value,
  upazilaName: selectedUpazila.value?.name,
}));

// ----------------------------- Global search -----------------------------
// Finds matches across ALL four levels at once, so a person can jump
// straight to a district or union without first drilling down to its page.
function ancestorLabel(type, item) {
  if (type === 'district') {
    const division = divisionsData.value.find((d) => d.id == item.division_id);
    return division?.name ?? '';
  }
  if (type === 'upazila') {
    const district = districtsData.value.find((d) => d.id == item.district_id);
    const division = district && divisionsData.value.find((d) => d.id == district.division_id);
    return [district?.name, division?.name].filter(Boolean).join(', ');
  }
  if (type === 'union') {
    const upazila = upazilasData.value.find((u) => u.id == item.upazilla_id);
    const district = upazila && districtsData.value.find((d) => d.id == upazila.district_id);
    return [upazila?.name, district?.name].filter(Boolean).join(', ');
  }
  return '';
}

const globalResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (q.length < 2) return [];
  const bnQ = searchQuery.value.trim();
  const matches = [];
  const scan = (list, type) => {
    for (const item of list) {
      if (item.name?.toLowerCase().includes(q) || (bnQ && item.bn_name?.includes(bnQ))) {
        matches.push({ item, type, subtitle: ancestorLabel(type, item) });
      }
    }
  };
  scan(divisionsData.value, 'division');
  scan(districtsData.value, 'district');
  scan(upazilasData.value, 'upazila');
  scan(unionsData.value, 'union');
  return matches.slice(0, 8);
});

function handleSelectResult(result) {
  jumpToResult(result);
  searchQuery.value = '';
}

function jumpToResult({ item, type }) {
  showLanding.value = false;
  if (type === 'division') {
    selectDivision(item);
  } else if (type === 'district') {
    const division = divisionsData.value.find((d) => d.id == item.division_id);
    if (division) selectedDivision.value = division;
    selectDistrict(item);
  } else if (type === 'upazila') {
    const district = districtsData.value.find((d) => d.id == item.district_id);
    const division = district && divisionsData.value.find((d) => d.id == district.division_id);
    if (division) selectedDivision.value = division;
    if (district) selectedDistrict.value = district;
    selectUpazila(item);
  } else if (type === 'union') {
    const upazila = upazilasData.value.find((u) => u.id == item.upazilla_id);
    const district = upazila && districtsData.value.find((d) => d.id == upazila.district_id);
    const division = district && divisionsData.value.find((d) => d.id == district.division_id);
    if (division) selectedDivision.value = division;
    if (district) selectedDistrict.value = district;
    if (upazila) selectedUpazila.value = upazila;
    currentStep.value = 'unions';
  }
}

// ------------------------------ Navigation --------------------------------
const selectDivision = (division) => {
  selectedDivision.value = division;
  selectedDistrict.value = null;
  selectedUpazila.value = null;
  currentStep.value = 'districts';
};
const selectDistrict = (district) => {
  selectedDistrict.value = district;
  selectedUpazila.value = null;
  currentStep.value = 'upazilas';
};
const selectUpazila = (upazila) => {
  selectedUpazila.value = upazila;
  currentStep.value = 'unions';
};
const resetToDivisions = () => {
  selectedDivision.value = null;
  selectedDistrict.value = null;
  selectedUpazila.value = null;
  currentStep.value = 'divisions';
};
const goBackStep = () => {
  if (currentStep.value === 'unions') {
    currentStep.value = 'upazilas';
    selectedUpazila.value = null;
  } else if (currentStep.value === 'upazilas') {
    currentStep.value = 'districts';
    selectedDistrict.value = null;
  } else if (currentStep.value === 'districts') {
    currentStep.value = 'divisions';
    selectedDivision.value = null;
  }
};

function jumpToStep(i) {
  if (i > activeStepIndex.value) return;
  if (i === 0) resetToDivisions();
  else if (i === 1 && selectedDivision.value) selectDivision(selectedDivision.value);
  else if (i === 2 && selectedDistrict.value) selectDistrict(selectedDistrict.value);
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+Bengali:wght@400;500;600&display=swap');

.font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
.font-plex { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
.font-bn { font-family: 'IBM Plex Sans Bengali', 'IBM Plex Sans', sans-serif; }
body { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }

/* Quiet survey-paper texture behind the whole app — a nod to the gazette/
   ledger feel of an administrative registry, kept faint so it never
   competes with content. */
.survey-texture {
  background-image: radial-gradient(circle, rgba(30, 42, 38, 0.055) 1px, transparent 1px);
  background-size: 22px 22px;
}

.river-draw {
  stroke-dasharray: 900;
  stroke-dashoffset: 900;
  opacity: 0.55;
}
.river-draw.run {
  transition: stroke-dashoffset 1.4s ease-out;
  stroke-dashoffset: 0;
}
@media (prefers-reduced-motion: reduce) {
  .river-draw { stroke-dashoffset: 0; transition: none; }
}
</style>