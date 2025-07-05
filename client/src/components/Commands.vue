<script setup>
import { ref, computed, watch } from 'vue';
import { defineEmits } from 'vue';

const emit = defineEmits(['executing', 'executed', 'show-log']);

const props = defineProps({
  title: String,
  commands: Array,
});

const selectedItem = ref(null);
const filter = ref('');
const filteredCommands = computed(() => {
  if (!filter.value) return props.commands;
  const searchLower = filter.value.toLowerCase();
  return props.commands.filter(cmd => cmd.name.toLowerCase().includes(searchLower));
});

const numberOfCommands = computed(() => {
  return props.commands.length;
});

function executeCommand(cmd) {
  emit('executing', cmd);
  fetch('/command/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: cmd })
  })
    .then(res => res.json())
    .then(data => {
      // Optionally handle response
      emit('executed', data); // send data to parent
    });
}

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
        <v-badge color="info" :content="numberOfCommands" floating></v-badge>
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <v-text-field hide-details="auto" placeholder="Search commands..."
        v-model="filter"></v-text-field>
      <template v-if="filteredCommands.length">
        <v-list v-model:selected="selectedItem" lines="two">
          <v-list-item v-for="command in filteredCommands"
            :key="command.name" :title="command.name" :subtitle="command.status"
            :value="command.name">
            <template v-slot:append >
              <v-btn v-if="command.status == 'idle'" color="grey-lighten-1" icon="mdi-play" size="small"
                variant="text"
                @click.stop="executeCommand(command.name)"></v-btn>
              <v-btn v-else-if="command.status == 'executed'" color="grey-lighten-1" icon="mdi-refresh" size="small"
                variant="text"
                @click.stop="executeCommand(command.name)"></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </template>
      <template v-else>
        <v-empty-state text="No commands">
        </v-empty-state>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
</style>
