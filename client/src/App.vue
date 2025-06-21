<template>
  <v-app>
    <v-layout class="rounded rounded-md border">
      <v-app-bar app color="surface-variant" dark title="Cyboard"></v-app-bar>

      <v-navigation-drawer app permanent left>
        <Commands title="Commands" :data="data?.commands || []" />
      </v-navigation-drawer>

      <v-main class="d-flex align-center justify-center">
        <v-container>
          <v-sheet border="dashed md" color="surface-light" height="200"
            rounded="lg" width="100%">
              <Result title="Result" />
          </v-sheet>
        </v-container>
      </v-main>

      <v-navigation-drawer app permanent right>
        <ExecutedCommands title="Executed Commands"
          :data="data?.executedCommands || []" />
      </v-navigation-drawer>
    </v-layout>
  </v-app>
</template>

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
