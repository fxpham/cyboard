<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';

interface LogType {
  title?: string;
  result?: string;
  detail?: string;
  screenshot?: string[];
  command?: string;
}

const props = defineProps<{ title?: string; log?: LogType }>();

const copied = ref(false);
const tab = ref<'result' | 'detail' | 'screenshot'>('result');
const showImageDialog = ref(false);
const selectedImage = ref<string | null>(null);
const selectedIndex = ref(0);

const screenshotList = computed(() => Array.isArray(props.log?.screenshot) ? props.log!.screenshot : []);

function openImage(img: string) {
  selectedIndex.value = screenshotList.value.findIndex(i => i === img);
  selectedImage.value = img;
  showImageDialog.value = true;
}
function closeImage() {
  showImageDialog.value = false;
  selectedImage.value = null;
}
function nextImage() {
  if (screenshotList.value.length === 0) return;
  selectedIndex.value = (selectedIndex.value + 1) % screenshotList.value.length;
  selectedImage.value = screenshotList.value[selectedIndex.value];
}
function prevImage() {
  if (screenshotList.value.length === 0) return;
  selectedIndex.value = (selectedIndex.value - 1 + screenshotList.value.length) % screenshotList.value.length;
  selectedImage.value = screenshotList.value[selectedIndex.value];
}

async function copyToClipboard(text: string) {
  try {
    const trimmedText = text.split('\n').filter(line => line !== '').join('\n');
    await navigator.clipboard.writeText(trimmedText);
    copied.value = true;
    setTimeout(() => copied.value = false, 1000);
  } catch (err) {
    console.error('Failed to copy text:', err);
  }
}
</script>

<template>
  <template v-if="log">
    <v-card>
      <v-tabs v-model="tab" fixed-tabs align-tabs="center">
        <v-tab value="result">Result</v-tab>
        <v-tab value="detail">Detail</v-tab>
        <v-tab value="screenshot">Screenshot
          <v-btn v-if="tab === 'screenshot' && log.screenshot.length" class="position-absolute right-0" variant="text"
            :href="`/result/screenshot/download/${encodeURIComponent(log.command)}`">
            <v-icon>mdi-download</v-icon></v-btn></v-tab>
      </v-tabs>
      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="result">
            <template v-if="log && log.result">
              <v-sheet border="md"
                class="pa-6 text-white mx-auto position-relative"
                color="#141518" width="860">
                <v-btn v-if="copied" class="position-absolute" size="small"
                  variant="text" disabled>
                  <v-icon>mdi-check</v-icon>Copied</v-btn>
                <v-btn v-else class="position-absolute" size="small"
                  variant="text"
                  @click.stop="copyToClipboard(log.result)"><v-icon>mdi-content-copy</v-icon>Copy</v-btn>
                <pre>{{ log.result }}</pre>
              </v-sheet>
            </template>
            <template v-else>
              <v-empty-state title="No result available."></v-empty-state>
            </template>
          </v-tabs-window-item>
          <v-tabs-window-item value="detail">
            <template v-if="log && log.detail">
              <v-sheet border="md" class="pa-6 text-white mx-auto"
                color="#141518" width="860">
                <pre>{{ log.detail }}</pre>
              </v-sheet>
            </template>
            <template v-else>
              <v-empty-state title="No detail available."></v-empty-state>
            </template>
          </v-tabs-window-item>
          <v-tabs-window-item value="screenshot">
            <template v-if="log.screenshot.length">
              <v-container fluid>
                <v-row>
                  <v-col v-for="img in log.screenshot" :key="img" cols="12"
                    md="3">
                    <v-img :lazy-src="img" :src="img" height="220"
                      @click="openImage(img)" class="image-clickable"></v-img>
                  </v-col>
                </v-row>
              </v-container>
              <v-dialog v-model="showImageDialog" max-width="800px"
                height="100%">
                <v-card class="image-dialog-card">
                  <v-card-actions
                    class="d-flex align-center image-dialog-actions">
                    <v-btn icon @click="prevImage"
                      :disabled="screenshotList.length <= 1">
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                    <span class="mx-2" style="min-width:fit-content">
                      {{ selectedIndex + 1 }} / {{ screenshotList.length }}
                    </span>
                    <v-btn icon @click="nextImage"
                      :disabled="screenshotList.length <= 1">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                    <span class="text-caption" style="overflow-wrap: anywhere;">{{ selectedImage }}</span>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" icon="mdi-close"
                      @click="closeImage"></v-btn>
                  </v-card-actions>
                  <v-img :src="selectedImage" contain
                    max-height="inherit"></v-img>
                </v-card>
              </v-dialog>
            </template>
            <template v-else>
              <v-empty-state title="No screenshot available."></v-empty-state>
            </template>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </template>
  <template v-else>
    <v-empty-state headline="No result"
      text="Select a executed command to see the result.">
    </v-empty-state>
  </template>
</template>

<style scoped>
.image-clickable {
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.image-clickable:hover {
  box-shadow: 0 0 8px #888;
}
.image-dialog-card {
  position: relative;
  padding-top: 56px;
}
.image-dialog-actions {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  background-color: #212121;
  border-bottom: 1px solid #cecece;
}
.v-window-item {
  height: calc(100vh - 146px);
  overflow: auto;
}
pre {
  white-space: pre-wrap;
}
</style>
