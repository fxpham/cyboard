<script setup>

import { ref, computed } from 'vue';

const props = defineProps({
  title: String,
  data: Array,
});

const filter = ref('');
const filteredCommands = computed(() => {
  if (!filter.value) return props.data;
  return props.data.filter(cmd =>
    cmd.title && cmd.title.toLowerCase().includes(filter.value.toLowerCase())
  );
});
</script>

<template>
  <div class="column column-2">
    <h3>{{ title }}</h3>
    <!-- <div id="result-actions" class="result-actions">
      <button id="delete-all-btn" class="button delete-all-btn">Delete
        all</button>
    </div> -->
    <div class="command-filter-wrap">
      <v-text-field placeholder="Filter commands..."
        v-model="filter"></v-text-field>
    </div>
    <!-- <div id="executed-command-list">
      <ul class="custom-list">
        <li v-if="filteredCommands.length === 0" class="custom-list-item">
          <span>Not found</span>
        </li>
        <li v-for="item in filteredCommands" :key="item"
          class="custom-list-item">
          <span>{{ item }}</span>
          <span>
            <button class="show-result-command"
              data-command="{{ item }}">Result</button>
            <button class="ml-4 show-screenshot-command"
              data-command="{{ item }}">Screenshot</button>
          </span>
        </li>
      </ul>
    </div> -->
  </div>
  <v-list :items="filteredCommands" active-class="text-blue"></v-list>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
