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
    cmd.toLowerCase().includes(filter.value.toLowerCase())
  );
});
</script>

<template>
  <div class="column column-2">
    <h2>{{ title }}</h2>
    <!-- <div id="result-actions" class="result-actions">
      <button id="delete-all-btn" class="button delete-all-btn">Delete
        all</button>
    </div> -->
    <div class="command-filter-wrap">
      <input type="text" id="command-filter-input" class="command-filter-input"
        placeholder="Filter commands..." v-model="filter">
    </div>
    <div id="executed-command-list">
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
            <!-- <button class="ml-4 show-screenshot-command"
              data-command="{{ item }}">Screenshot</button> -->
          </span>
        </li>
        <!-- <li class="custom-list-item"><span>No commands executed yet.</span></li> -->
      </ul>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
