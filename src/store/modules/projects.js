export default {
  state: {
    projectSubcomponent: "ProjectTable",
    projectList: [],
    projectIdValue: "",
  },
  mutations: {
    switchToNewProjectSubcomponent(state, payload) {
      state.projectSubcomponent = payload.subcomponent;
      if (payload.projectId !== "") {
        state.projectIdValue = payload.projectId;
      } else {
        state.projectIdValue = "";
      }
    },
    setProjectId(state, payload) {
      state.projectIdValue = payload.projectId;
    },
  },
  actions: {
    setProjectSubcomponent(context, payload) {
      context.commit("switchToNewGoalSubcomponent", payload);
    },
    setProjectId(context, payload) {
      context.commit("setProjectId", payload);
    },
  },
  getters: {
    currentProjectSubcomponent(state) {
      return state.projectSubcomponent;
    },
    currentProjectId(state) {
      return state.projectIdValue;
    },
  },
  modules: {},
};
