<template>
  <v-app>
    <v-layout class="rounded rounded-md border">
      <v-app-bar app color="grey-darken-3" dark>
        <v-app-bar-title>Cyboard</v-app-bar-title>

        <v-btn icon @click="refreshApplication">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>

        <v-btn icon @click="deleteAllResults">
          <v-icon>mdi-delete</v-icon>
        </v-btn>

      </v-app-bar>
      <v-navigation-drawer app permanent left>
        <Commands title="Commands" :commands="data?.commands || []" />
      </v-navigation-drawer>

      <v-main>
        <Result title="Result" :log="logResult" />
      </v-main>

      <!-- <v-navigation-drawer app permanent right>
        <ExecutedCommands title="State Commands"
          :data="data?.stateCommands || []" @show-log="handleShowLog" />
      </v-navigation-drawer> -->

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
import ExecutedCommands from './components/ExecutedCommands.vue';
import Result from './components/Result.vue';

const data = ref(null);
const logResult = ref(null);
const showDeleteDialog = ref(false);
const showRefreshDialog = ref(false);

onMounted(async () => {
  const res = await fetch('/command');
  const response = await res.json();
  data.value = response;
  console.log(data);
});

function deleteAllResults() {
  showDeleteDialog.value = true;
}

function refreshApplication() {
  showRefreshDialog.value = true;
  fetch('/command', {
    method: 'GET',
  })
    .then(res => res.json())
    .then(response => {
      data.value = response;
      showRefreshDialog.value = false;
    });
}

function confirmDelete() {
  fetch('/result/delete', {
    method: 'DELETE',
  })
    .then(res => res.json())
    .then(data => {
      // Optionally handle response
      console.log('All results deleted:', data);
      showDeleteDialog.value = false;
    });
}

function cancelDelete() {
  showDeleteDialog.value = false;
}

function handleShowLog(log) {
  logResult.value = log;
}
</script>

<style scoped>
</style>
