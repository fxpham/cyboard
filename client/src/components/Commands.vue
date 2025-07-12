<script setup>
import { ref, computed, watch } from 'vue';
import { defineEmits } from 'vue';

const emit = defineEmits([
  'executing',
  'executed',
  'cancelled',
  'deleted',
  'show-log']);

const props = defineProps({
  title: String,
  commands: Array,
});

const confirmDeleteResultDialog = ref(false);
const selectedItem = ref(null);
const filter = ref('');
const state = ref('');
const disableCancelCommand = ref('');
const filteredCommands = computed(() => {
  if (!filter.value && !state.value) {
    return props.commands;
  }
  else if (!state.value) {
    const searchLower = filter.value.toLowerCase();
    return props.commands.filter(cmd => cmd.name.toLowerCase().includes(searchLower));
  }
  else {
    const searchLower = filter.value.toLowerCase();
    return props.commands.filter(cmd => cmd.name.toLowerCase().includes(searchLower) && cmd.status === state.value);
  }
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

function cancelCommand(cmd) {
  disableCancelCommand.value = cmd;
  fetch('/command/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: cmd })
  })
    .then(res => res.json())
    .then(data => {
      emit('cancelled', data); // send data to parent
    });
}

function deleteResult(cmd) {
  confirmDeleteResultDialog.value = cmd;
}

function confirmDelete() {
  console.log(confirmDeleteResultDialog.value);
  fetch('/result/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: confirmDeleteResultDialog.value })
  })
    .then(res => res.json())
    .then(data => {
      confirmDeleteResultDialog.value = false;
      // Optionally handle response
      emit('deleted', data); // send data to parent
    });
}

function cancelDelete() {
  confirmDeleteResultDialog.value = false;
}

watch(selectedItem, async (newItem) => {
  if (Object.keys(newItem).length) {
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
      <v-list-item class="px-0">
        <template v-slot:title>
          <v-card-title>{{ title }}<v-badge class="px-2" color="info"
              :content="filteredCommands.length" floating></v-badge>
          </v-card-title>
        </template>

        <template v-slot:append>
          <v-btn-toggle v-model="state" variant="outlined" divided
            color="primary">
            <v-btn value="idle" icon="mdi-play"></v-btn>
            <v-btn value="waiting" icon="mdi-progress-clock"></v-btn>
            <v-btn value="running" icon="mdi-test-tube"></v-btn>
            <v-btn value="executed" icon="mdi-check-all"></v-btn>
          </v-btn-toggle>
        </template>
      </v-list-item>
    </v-card-item>
    <v-card-text>
      <v-text-field hide-details="auto" placeholder="Search commands..."
        v-model="filter"></v-text-field>
      <template v-if="filteredCommands.length">
        <v-list v-model:selected="selectedItem" lines="two">
          <v-list-item v-for="command in filteredCommands" :key="command.name"
            :title="command.name" :subtitle="command.status"
            :value="command.name">
            <template v-slot:append>
              <v-btn v-if="command.status == 'idle'" color="grey-lighten-1"
                icon="mdi-play" size="small" variant="text"
                @click.stop="executeCommand(command.name)"></v-btn>
              <v-progress-circular v-else-if="command.status == 'running'"
                color="grey-lighten-1" :size="18"
                indeterminate></v-progress-circular>
              <v-btn v-else-if="command.status == 'waiting'"
                color="grey-lighten-1" icon="mdi-close" size="small"
                variant="text" :disabled="disableCancelCommand === command.name"
                @click.stop="cancelCommand(command.name)"></v-btn>
              <template v-else-if="command.status == 'executed'">
                <v-btn color="grey-lighten-1" icon="mdi-delete" size="small"
                  variant="text"
                  @click.stop="deleteResult(command.name)"></v-btn>
                <v-btn color="grey-lighten-1" icon="mdi-refresh" size="small"
                  variant="text"
                  @click.stop="executeCommand(command.name)"></v-btn>
              </template>
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

  <v-dialog v-model="confirmDeleteResultDialog" max-width="400" persistent>
    <v-card prepend-icon="mdi-delete"
      :text="`Are you sure you want to delete ${confirmDeleteResultDialog} result?`"
      title="Confirm delete">
      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" @click="cancelDelete">
          Cancel
        </v-btn>
        <v-btn color="error" @click="confirmDelete">
          Delete
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-progress-circular {
  margin-right: 10px;
}
</style>
