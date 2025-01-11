import { createApp } from "vue";
import App from "./App.vue";
import { setupStore } from './store';
// import 'naive-ui/dist/index.css';
import 'uno.css';

async function setupApp() {
  const app = createApp(App);
  setupStore(app);

  app.mount("#app");
}

setupApp();