<script setup>

defineProps({
  title: String,
})

</script>

<template>
  <div class="column column-3">
    <h2>{{ title }}</h2>
    <div id="command-result">
      <p class="result-placeholder">Select a executed command to see the result.</p>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
