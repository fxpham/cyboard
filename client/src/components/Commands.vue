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
  return props.commands
    .map(group => {
      const filtered = group.commands.filter(cmd =>
        cmd.name.toLowerCase().includes(searchLower)
      );
      return filtered.length
        ? { groupName: group.groupName, commands: filtered }
        : null;
    })
    .filter(Boolean);
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
      console.log('Command executed:', data);
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
        <v-list v-model:selected="selectedItem">
          <template v-for="(group, index) in filteredCommands" :key="index">
            <v-list-subheader v-if="group.commands.length > 0">{{
              group.groupName }}</v-list-subheader>
            <v-list-item v-for="(command, cmdIndex) in group.commands"
              :key="`${index}-${cmdIndex}`" :title="command.name"
              :value="command.name">
              <template #append v-if="group.groupName == 'Spec commands'">
                <v-btn color="grey-lighten-1" icon="mdi-play" size="small"
                  variant="text"
                  @click.stop="executeCommand(command.name)"></v-btn>
              </template>
              <template #append v-if="group.groupName == 'Executed commands'">
                <v-btn color="grey-lighten-1" icon="mdi-refresh" size="small"
                  variant="text"
                  @click.stop="executeCommand(command.name)"></v-btn>
              </template>
            </v-list-item>
            <v-divider
              v-if="group.commands.length > 0 && index !== filteredCommands.length - 1"></v-divider>
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
