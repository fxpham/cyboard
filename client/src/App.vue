<template>
  <v-app>
    <v-layout class="rounded rounded-md border">
      <v-app-bar app color="grey-darken-3" dark>
        <v-app-bar-title>Cyboard</v-app-bar-title>

        <v-btn icon @click="openCypress" :disabled="opening">
          <v-icon>mdi-open-in-app</v-icon>
        </v-btn>

        <v-btn icon @click="refreshApplication">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>

        <v-btn icon @click="deleteAllResults">
          <v-icon>mdi-delete</v-icon>
        </v-btn>

      </v-app-bar>
      <v-navigation-drawer app permanent left width="480">
        <Commands title="Commands" :commands="commands || []"
          @reload="refreshApplication" @executing="handleCommandExecuting"
          @cancelled="handleCommandCancelled" @deleted="handleResultDeleted"
          @executed="handleCommandExecuted" @show-log="handleShowLog" />
      </v-navigation-drawer>

      <v-main>
        <Result title="Result" :log="logResult" />
      </v-main>

      <v-dialog v-model="showDeleteDialog" max-width="400" persistent>
        <v-card prepend-icon="mdi-delete"
          text="Are you sure you want to delete all results?"
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

      <v-dialog v-model="showRefreshDialog" max-width="320" persistent>
        <v-list class="py-2" color="primary" elevation="12" rounded="lg">
          <v-list-item title="Refreshing Application...">
            <template v-slot:prepend>
              <div class="pe-4">
                <v-icon color="primary" size="x-large"></v-icon>
              </div>
            </template>

            <template v-slot:append>
              <v-progress-circular color="primary"
                indeterminate="disable-shrink" size="16"
                width="2"></v-progress-circular>
            </template>
          </v-list-item>
        </v-list>
      </v-dialog>
    </v-layout>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Commands from './components/Commands.vue';
import Result from './components/Result.vue';

const commands = ref(null);
const logResult = ref(null);
const opening = ref(false);
const showDeleteDialog = ref(false);
const showRefreshDialog = ref(false);

async function reloadData() {
  const res = await fetch('/command');
  const data = await res.json();
  commands.value = data;
}

onMounted(() => {
  reloadData();
});

function handleResultDeleted() {
  reloadData();
}

function deleteAllResults() {
  showDeleteDialog.value = true;
}

function openCypress() {
  opening.value = true;
  fetch('/command/execute/cypress')
    .then(res => res.json())
    .then(data => {
      opening.value = data.stopped ? false : true;
    });
}

function refreshApplication() {
  showRefreshDialog.value = true;
  reloadData().then(() => {
    showRefreshDialog.value = false;
  });
}

function confirmDelete() {
  fetch('/result/delete-all', {
    method: 'DELETE',
  })
    .then(res => res.json())
    .then(data => {
      reloadData();
      // Optionally handle response
      // console.log('All results deleted:', data);
      showDeleteDialog.value = false;
    });
}

function cancelDelete() {
  showDeleteDialog.value = false;
}

function handleShowLog(log) {
  logResult.value = log;
}

function handleCommandExecuted(data) {
  // Do something with the executed command data
  commands.value = data;
}

function handleCommandCancelled(data) {
  // Do something with the executed command data
  commands.value = data;
}

function handleCommandExecuting(cmd) {
  let executing = commands.value.find(command => command.status === 'running');
  commands.value.forEach(command => {
    if (command.name === cmd) {
      command.status = executing ? 'waiting' : 'running';
      return;
    }
  });
}
</script>

<style scoped></style>
