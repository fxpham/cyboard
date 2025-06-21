<script setup>
const props = defineProps({
  title: String,
  log: String,
});
</script>

<template>
  <div class="column column-3">
    <h2>{{ title }}</h2>
    <div id="command-result">
      <template v-if="log">
        <pre>{{ log }}</pre>
      </template>
      <template v-else>
        <p class="result-placeholder">Select a executed command to see the result.</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
