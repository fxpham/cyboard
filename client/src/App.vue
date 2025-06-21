<script setup>
import Commands from './components/Commands.vue';
import ExecutedCommands from './components/ExecutedCommands.vue';
import Result from './components/Result.vue';
</script>

<template>
  <div class="custom-columns">
    <!-- First column: 1/4 width -->
    <Commands title="Commands"/>
    <!-- Second column: 1/4 width -->
    <ExecutedCommands title="Executed Commands"/>
    <!-- Third column: 2/4 width -->
    <Result title="Result"/>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
