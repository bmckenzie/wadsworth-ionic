import { createApp } from "vue";
import "@fortawesome/fontawesome-free/css/all.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from "@fortawesome/vue-fontawesome";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./firebaseConfig";
// Font Awesome Icon Import
import {
  faBullseye,
  faCheckSquare,
  faClipboard,
  faClipboardList,
  faEdit,
  faHeart,
  faHistory,
  faHome,
  faProjectDiagram,
  faSignOutAlt,
  faStickyNote,
  faTasks,
  faUserClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import VueDraggable from "vue-draggable";

//Element+ Import
import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";

const app = createApp(App);

// Font Awesome Icons
library.add(faEdit);
library.add(faBullseye);
library.add(faHome);
library.add(faProjectDiagram);
library.add(faTasks);
library.add(faHistory);
library.add(faUserClock);
library.add(faCheckSquare);
library.add(faClipboardList);
library.add(faClipboard);
library.add(faStickyNote);
library.add(faHeart);
library.add(faSignOutAlt);
library.add(faUsers);

app.component("font-awesome-icon", FontAwesomeIcon);
app.component("font-awesome-layers", FontAwesomeLayers);
app.component("font-awesome-layers-text", FontAwesomeLayersText);
app.use(store);
app.use(router);
app.use(ElementPlus);
app.use(VueDraggable);
app.mount("#app");
