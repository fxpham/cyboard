<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: String,
  commands: Array,
});

const filter = ref('');
const filteredCommands = computed(() => {
  if (!filter.value) return props.commands;
  const searchLower = filter.value.toLowerCase();
  return props.commands
    .map(group => {
      const filtered = group.commands.filter(cmd =>
        cmd.toLowerCase().includes(searchLower)
      );
      return filtered.length
        ? { groupName: group.groupName, commands: filtered }
        : null;
    })
    .filter(Boolean);
});

const numberOfCommands = computed(() => {
  return props.commands.reduce((total, group) => total + group.commands.length, 0);
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
          <template v-for="(group, index) in filteredCommands" :key="index">
            <v-list-subheader>{{ group.groupName }}</v-list-subheader>
            <v-list-item v-for="(command, cmdIndex) in group.commands"
              :key="`${index}-${cmdIndex}`" :title="command">
              <template #append="{ command }">
                <v-btn color="grey-lighten-1" icon="mdi-play" size="small"
                  variant="text" @click.stop="executeCommand(command)"></v-btn>
              </template>
            </v-list-item>
            <v-divider v-if="index !== filteredCommands.length - 1"></v-divider>
          </template>
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
