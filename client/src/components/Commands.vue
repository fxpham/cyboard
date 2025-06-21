<script setup>
import { ref } from 'vue'

defineProps({
  title: String,
})

const data = ref('')

async function fetchData() {
  const res = await fetch('/command/specs');
  const response = await res.json();
  data.value = response;
}
</script>

<template>
  <div class="column column-1">
    <h2>{{ title }}</h2>
    <div id="progress-info" class="progress-info">
      <p><span id="progress-status"></span></p>
      <p><span id="progress-running"></span></p>
    </div>
    <div class="command-filter-wrap">
      <input type="text" id="command-filter-input" class="command-filter-input"
        placeholder="Filter commands...">
    </div>
    <div id="command-list">
      <ul class="custom-list">
        <li v-for="item in data" class="custom-list-item">
          <span>{{ item }}</span>
          <button class="run-spec-command" data-command="{{ item }}">Run</button>
        </li>
      </ul>
    </div>
  <div class="card">
    <button type="button" @click="fetchData">Fetch Data</button>
  </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
