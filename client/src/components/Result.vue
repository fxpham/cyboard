<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  title: String,
  log: Object,
});

const tab = ref('result');
const showImageDialog = ref(false);
const selectedImage = ref(null);
const selectedIndex = ref(0);

const screenshotList = computed(() => Array.isArray(props.log?.screenshot) ? props.log.screenshot : []);

function openImage(img) {
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
</script>

<template>
  <template v-if="log">
    <v-card>
      <v-tabs v-model="tab" fixed-tabs align-tabs="center">
        <v-tab value="result">Result</v-tab>
        <v-tab value="detail">Detail</v-tab>
        <v-tab value="screenshot">Screenshot</v-tab>
      </v-tabs>
      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="result">
            <template v-if="log && log.result">
              <v-card>
                <v-card-text class="text-center">
                  <pre>{{ log.result }}</pre>
                </v-card-text>
              </v-card>
            </template>
            <template v-else>
              <v-empty-state title="No result available."></v-empty-state>
            </template>
          </v-tabs-window-item>
          <v-tabs-window-item value="detail">
            <template v-if="log && log.detail">
              <pre>{{ log.detail }}</pre>
            </template>
            <template v-else>
              <v-empty-state title="No detail available."></v-empty-state>
            </template>
          </v-tabs-window-item>
          <v-tabs-window-item value="screenshot">
            <template v-if="log && log.screenshot">
              <v-container fluid>
                <v-row>
                  <v-col v-for="img in log.screenshot" :key="img" cols="12"
                    md="4">
                    <v-img :lazy-src="img" :src="img" height="205" cover
                      @click="openImage(img)" class="image-clickable"></v-img>
                  </v-col>
                </v-row>
              </v-container>
              <v-dialog v-model="showImageDialog" max-width="800px">
                <v-card class="image-dialog-card">
                  <v-card-actions
                    class="d-flex align-center image-dialog-actions">
                    <v-btn icon @click="prevImage"
                      :disabled="screenshotList.length <= 1">
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                    <span class="mx-2">
                      {{ selectedIndex + 1 }} / {{ screenshotList.length }}
                    </span>
                    <v-btn icon @click="nextImage"
                      :disabled="screenshotList.length <= 1">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text
                      @click="closeImage">Close</v-btn>
                  </v-card-actions>
                  <v-img :src="selectedImage" contain></v-img>
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
    <v-empty-state
      headline="No result"
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
</style>
