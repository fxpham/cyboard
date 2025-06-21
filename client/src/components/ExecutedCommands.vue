<script setup>
import { ref } from 'vue'

defineProps({
  title: String,
})

const data = ref('')

async function fetchData() {
  const res = await fetch('/command/executed');
  const response = await res.json();
  data.value = response;
}
</script>

<template>
  <div class="column column-2">
    <h2>{{ title }}</h2>
    <div id="result-actions" class="result-actions">
      <button id="delete-all-btn" class="button delete-all-btn">Delete all</button>
    </div>
    <div id="executed-command-list">
      <ul class="custom-list">
        <li v-for="item in data" class="custom-list-item">
          <span>{{ item }}</span>
          <span>
            <button class="show-result-command"
              data-command="{{ item }}">Result</button>
            <button class="ml-4 show-screenshot-command"
              data-command="{{ item }}">Screenshot</button>
          </span>
        </li>
        <!-- <li class="custom-list-item"><span>No commands executed yet.</span></li> -->
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
