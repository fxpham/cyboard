<script setup>
import { ref, onMounted } from 'vue';
import Commands from './components/Commands.vue';
import ExecutedCommands from './components/ExecutedCommands.vue';
import Result from './components/Result.vue';

const data = ref(null);

onMounted(async () => {
  const res = await fetch('/command/data');
  const response = await res.json();
  data.value = response;
});

</script>

<template>
  <div class="custom-columns">
    <!-- First column: 1/4 width -->
    <Commands title="Commands" :data="data?.commands || []"/>
    <!-- Second column: 1/4 width -->
    <ExecutedCommands title="Executed Commands" :data="data?.executedCommands"/>
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
