<script setup>
import { ref, computed } from 'vue';
import { defineEmits } from 'vue';

const emit = defineEmits(['executed']);

const props = defineProps({
  title: String,
  commands: Array,
});

const filter = ref('');
const filteredCommands = computed(() => {
  if (!filter.value) return props.commands;
  const searchLower = filter.value.toLowerCase();
  return props.commands.find(cmd => cmd.toLowerCase.includes(searchLower));
});

const numberOfCommands = computed(() => {
  return props.commands.length;
});

function executeCommand(cmd) {
  fetch('/command/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: cmd })
  })
    .then(res => res.json())
    .then(data => {
      // Optionally handle response
      emit('executed', data); // send data to parent
      console.log('Command executed:', data);
    });
}
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
        <v-list>
            <v-list-subheader>Spec Commands</v-list-subheader>
            <v-list-item v-for="(command, index) in filteredCommands"
              :key="index" :title="command.name">
              <template #append>
                <v-btn color="grey-lighten-1" icon="mdi-play" size="small"
                  variant="text" @click.stop="executeCommand(command.name)"></v-btn>
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
