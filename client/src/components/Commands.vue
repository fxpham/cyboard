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
  <div class="column column-1">
    <h2>{{ title }}</h2>
    <!-- <div id="progress-info" class="progress-info">
      <p><span id="progress-status"></span></p>
      <p><span id="progress-running"></span></p>
    </div> -->
    <div class="command-filter-wrap">
      <input type="text" id="command-filter-input" class="command-filter-input"
        placeholder="Filter commands..." v-model="filter">
    </div>
    <div id="command-list">
      <ul class="custom-list">
        <li v-if="filteredCommands.length === 0" class="custom-list-item">
          <span>Not found</span>
        </li>
        <li v-for="item in filteredCommands" :key="item" class="custom-list-item">
          <span>{{ item }}</span>
          <button class="run-spec-command" :data-command="item">Run</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
