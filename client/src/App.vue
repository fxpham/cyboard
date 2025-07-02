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
      <v-navigation-drawer app permanent left width="480">
        <Commands title="Commands" :commands="commands || []"
          @reload="refreshApplication" @executing="handleCommandExecuting" @executed="handleCommandExecuted"
          @show-log="handleShowLog" />
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
const showDeleteDialog = ref(false);
const showRefreshDialog = ref(false);

function processData(data) {
  return [
    {
      groupId: "spec",
      groupName: "Spec commands",
      commands: data.filter(cmd => cmd.status === 'idle')
    },
    {
      groupId: "waiting",
      groupName: "Waiting commands",
      commands: data.filter(cmd => cmd.status === 'waiting')
    },
    {
      groupId: "running",
      groupName: "Executing command",
      commands: data.filter(cmd => cmd.status === 'running')
    },
    {
      groupId: "executed",
      groupName: "Executed commands",
      commands: data.filter(cmd => cmd.status === 'executed')
    }
  ]
}

async function reloadData() {
  const res = await fetch('/command');
  const data = await res.json();
  commands.value = processData(data)
}

onMounted(() => {
  reloadData()
});

function deleteAllResults() {
  showDeleteDialog.value = true;
}

function refreshApplication() {
  showRefreshDialog.value = true;
  reloadData().then(() => {
    showRefreshDialog.value = false;
  });
}

function confirmDelete() {
  fetch('/result/delete', {
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
  commands.value = processData(data)
}
function handleCommandExecuting(cmd) {
  let executing = commands.value.find(group => group.groupId === 'running');
  let waiting = commands.value.find(group => group.groupId === 'waiting');

  commands.value.forEach(group => {
    group.commands.forEach(command => {
      if (command.name === cmd) {
        if (executing.commands.length === 0) {
          command.status = 'running';
          executing.commands.push(command);
          return;
        }
        else {
          command.status = 'waiting';
          waiting.commands.push(command);
          return;
        }
      }
    })
  });
}
</script>

<style scoped>
</style>
