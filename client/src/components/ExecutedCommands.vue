<script setup>
import { ref, computed, watch } from 'vue';
import { defineEmits } from 'vue';

const emit = defineEmits(['show-log']);

const props = defineProps({
  title: String,
  data: Array,
});

const selectedItem = ref(null);
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

watch(selectedItem, async (newItem) => {
  if (newItem) {
    try {
      fetch(`/result/${encodeURIComponent(newItem)}`)
        .then(res => res.json())
        .then(data => {
          emit('show-log', data);
        });
    } catch (error) {
      console.error('API error:', error);
    }
  }
});

</script>

<template>
  <v-card>
    <v-card-item>
      <v-card-title>
        {{ title }}
        <!-- <v-badge color="error" :content="numberOfCommands" inline></v-badge> -->
      </v-card-title>
    </v-card-item>

    <v-card-text>
      <v-text-field hide-details="auto" placeholder="Filter commands..."
        v-model="filter"></v-text-field>
      <template v-if="filteredCommands.length">
        <v-list :items="filteredCommands" active-class="text-blue"
          v-model:selected="selectedItem"></v-list>
      </template>
      <template v-else>
        <v-empty-state text="No executed commands">
        </v-empty-state>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
</style>
