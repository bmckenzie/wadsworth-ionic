export default {
  state: {
    taskSubcomponent: "SubTasks",
    taskIdValue: "",
  },
  mutations: {
    switchToNewTaskSubcomponent(state, payload) {
      state.taskSubcomponent = payload.subcomponent;
      if (payload.taskIdValue !== "") {
        state.taskIdValue = payload.taskId;
      } else {
        state.taskIdValue = "";
      }
    },
    setTaskId(state, payload) {
      state.taskIdValue = payload.taskId;
    },
  },
  actions: {
    setTaskSubcomponent(context, payload) {
      context.commit("switchToNewTaskSubcomponent", payload);
    },
    setTaskId(context, payload) {
      context.commit("setTaskId", payload);
    },
  },
  getters: {
    currentTaskSubcomponent(state) {
      return state.taskSubcomponent;
    },
    currentTaskId(state) {
      return state.taskIdValue;
    },
  },
  modules: {},
};
