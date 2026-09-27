<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col justify-between">
    <div>
      <h3 class="text-xl font-bold text-emerald-800 mb-2">{{ division.name }}</h3>
      <p class="text-sm text-gray-600 mb-1"><strong>Bengali:</strong> {{ division.bn_name }}</p>
      <p class="text-sm text-gray-600 mb-4">
        <strong>Website:</strong> 
        <a :href="'https://' + division.url" target="_blank" class="text-emerald-600 underline hover:text-emerald-800">
          {{ division.url }}
        </a>
      </p>
    </div>
    <button 
      @click="$emit('select', division)" 
      class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer"
    >
      Proceed to Districts
    </button>
  </div>
</template>

<script setup>
defineProps({
  division: {
    type: Object,
    required: true
  }
});

defineEmits(['select']);
</script>