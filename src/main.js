import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import "leaflet/dist/leaflet.css"

const app = createApp(App)
app.use(App)
app.mount('#app')