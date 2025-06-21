import { createApp } from 'vue'
// import './style.css'
// Vuetify
import vuetify from './plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'

createApp(App).use(vuetify).mount('#app')
