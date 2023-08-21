import { createStore } from "vuex";
import goals from "./modules/goals";
import projects from "./modules/projects";
import tasks from "./modules/tasks";
import habits from "./modules/habits";
import createPersistedState from "vuex-persistedstate";

export default createStore({
  state: {
    userId: "",
    user: null,
  },
  mutations: {
    changeUserId(state, payload) {
      state.userId = payload.userId;
    },
    LOGIN: (state, user) => (state.user = user),
    LOGOUT: (state) => (state.user = null),
  },
  actions: {
    setUserId(context, payload) {
      context.commit("changeUserId", payload);
    },
  },
  getters: {
    getUserId: (state) => {
      return state.userId;
    },
    user(state) {
      return state.user;
    },
  },
  modules: { goals, projects, tasks, habits },
  plugins: [createPersistedState()],
});
