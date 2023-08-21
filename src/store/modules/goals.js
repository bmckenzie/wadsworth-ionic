export default {
  state: {
    goalSubcomponent: "GoalStack",
    goalId: "",
  },
  mutations: {
    switchToNewGoalSubcomponent(state, payload) {
      state.goalSubcomponent = payload.subcomponent;
      if (payload.goalId !== null) {
        state.goalId = payload.goalId;
      } else {
        state.goalId = null;
      }
    },
  },
  actions: {
    setGoalSubcomponent(context, payload) {
      context.commit("switchToNewGoalSubcomponent", payload);
    },
  },
  getters: {
    currentGoalSubcomponent(state) {
      return state.goalSubcomponent;
    },
    currentGoalId(state) {
      return state.goalId;
    },
  },
  modules: {},
};
