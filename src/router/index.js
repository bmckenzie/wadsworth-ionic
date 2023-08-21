import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import Goals from "../views/Goals.vue";
import Roles from "../views/Roles.vue";
import Projects from "../views/Projects.vue";
import Tasks from "../views/Tasks.vue";
import BlockTime from "../views/BlockTime.vue";
import Habits from "../views/Habits.vue";
import Checklists from "../views/Checklists.vue";
import Logs from "../views/Logs.vue";
import Notes from "../views/Notes.vue";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { onAuthStateInit } from "@/firebaseConfig.js";
// import store from "../store";
import { getAuth } from "@firebase/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { public: true },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { public: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/goals",
    name: "Goals",
    component: Goals,
  },
  {
    path: "/roles",
    name: "Roles",
    component: Roles,
  },
  {
    path: "/projects",
    name: "Projects",
    component: Projects,
  },
  {
    path: "/tasks",
    name: "Tasks",
    component: Tasks,
  },
  {
    path: "/block",
    name: "BlockTime",
    component: BlockTime,
  },
  {
    path: "/habits",
    name: "Habits",
    component: Habits,
  },
  {
    path: "/checklists",
    name: "Checklists",
    component: Checklists,
  },
  {
    path: "/logs",
    name: "Logs",
    component: Logs,
  },
  {
    path: "/notes",
    name: "Notes",
    component: Notes,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  const publicPage = to.matched.some((record) => record.meta.pubilc);
  if (!publicPage) {
    getAuth().onAuthStateChanged((user) => {
      if (!user) {
        next({ path: "/" });
      } else {
        next();
      }
    });
  }
});

export default router;
