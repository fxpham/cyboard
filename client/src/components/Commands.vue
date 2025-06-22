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
const numberOfCommands = computed(() => {
  return props.data.filter(cmd =>
    cmd.type !== 'subheader' && cmd.type !== 'divider'
  ).length;
});

function executeCommand(cmd) {
  fetch('/command/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: cmd.title })
  })
    .then(res => res.json())
    .then(data => {
      // Optionally handle response
      console.log('Command executed:', data);
    });
}
</script>

<template>
  <h3>{{ title }} - {{ numberOfCommands }}</h3>
  <v-text-field hide-details="auto" placeholder="Filter commands..."
    v-model="filter"></v-text-field>
  <v-list :items="filteredCommands" :key="title" density="compact" item-props>
    <template #append="{ item }">
      <v-btn color="grey-lighten-1" icon="mdi-play" size="small"
        variant="text" @click.stop="executeCommand(item)"></v-btn>
    </template>
  </v-list>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
