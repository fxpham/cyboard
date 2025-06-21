<script setup>
import { ref, computed, watch } from 'vue';
import { defineEmits } from 'vue';

const emit = defineEmits(['show-log']);

const props = defineProps({
  title: String,
  data: Array,
});

const selectedItem = ref(null);
const filter = ref('');
const filteredCommands = computed(() => {
  if (!filter.value) return props.data;
  return props.data.filter(cmd =>
    cmd.title && cmd.title.toLowerCase().includes(filter.value.toLowerCase())
  );
});

const numberOfCommands = computed(() => {
  return props.data.filter(cmd =>
    cmd.type !== 'subheader' && cmd.type !== 'divider'
  ).length;
});

watch(selectedItem, async (newItem) => {
  if (newItem) {
    try {
      fetch(`/result/${encodeURIComponent(newItem)}`)
        .then(res => res.json())
        .then(data => {
          emit('show-log', data);
        });
    } catch (error) {
      console.error('API error:', error);
    }
  }
});

</script>

<template>
  <div class="column column-2">
    <h3>{{ title }} - {{ numberOfCommands }}</h3>
    <div class="command-filter-wrap">
      <v-text-field hide-details="auto" placeholder="Filter commands..."
        v-model="filter"></v-text-field>
    </div>
  </div>
  <v-list :items="filteredCommands" active-class="text-blue"
    v-model:selected="selectedItem"></v-list>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
