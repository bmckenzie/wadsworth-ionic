<template>
  <el-container>
    <el-header><h1>Your Goals</h1></el-header>
    <el-container>
      <el-aside width="200px"><sidebar-menu></sidebar-menu></el-aside>
      <el-main>
        <el-button
          v-if="currentGoalComponent === 'GoalStack'"
          @click="changeGoalSubcomponent('NewGoal')"
        >
          Add Goal
        </el-button>
        <component :is="currentGoalComponent"></component>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { getAuth } from "firebase/auth";
import SidebarMenu from "../components/SidebarMenu.vue";
import GoalStack from "../components/goals/GoalStack.vue";
import NewGoal from "../components/goals/NewGoal.vue";
import EditGoal from "../components/goals/EditGoal.vue";
import ViewGoal from "../components/goals/ViewGoal.vue";

export default {
  name: "Goals",
  data() {
    return {};
  },
  components: {
    SidebarMenu,
    GoalStack,
    NewGoal,
    EditGoal,
    ViewGoal,
  },
  methods: {
    changeGoalSubcomponent(sub) {
      this.$store.dispatch("setGoalSubcomponent", {
        subcomponent: sub,
        goalId: null,
      });
    },
  },
  mounted() {
    getAuth().onAuthStateChanged((user) => {
      if (!user) {
        this.$router.push("/");
      }
    });
  },
  computed: {
    currentGoalComponent() {
      return this.$store.getters.currentGoalSubcomponent;
    },
  },
};
</script>

<style scoped></style>
