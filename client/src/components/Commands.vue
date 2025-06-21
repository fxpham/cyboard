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
</script>

<template>
  <h3>{{ title }} - {{ numberOfCommands }}</h3>
  <v-text-field placeholder="Filter commands..."
    v-model="filter"></v-text-field>
  <v-list :items="filteredCommands" :key="title" density="compact" item-props>
    <template v-slot:append>
      <v-btn color="grey-lighten-1" icon="mdi-play" size="small"
        variant="text"></v-btn>
    </template>
  </v-list>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
