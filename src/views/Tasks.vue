<template>
  <el-header><h2>Your Tasks</h2></el-header>
  <el-container>
    <el-aside width="200px"><sidebar-menu></sidebar-menu></el-aside>
    <el-main><component :is="currentTaskComponent"></component></el-main>
  </el-container>
</template>

<script>
import { getAuth } from "firebase/auth";
import SidebarMenu from "../components/SidebarMenu.vue";
import SubTasks from "../components/tasks/SubTasks.vue";

export default {
  name: "Tasks",
  data() {
    return {};
  },
  components: {
    SidebarMenu,
    SubTasks,
  },
  methods: {
    changeTaskSubcomponent(sub) {
      this.$store.dispatch("setTaskSubcomponent", {
        subcomponent: sub,
        taskId: null,
      });
    },
  },
  mounted() {
    this.changeTaskSubcomponent("SubTasks");
    getAuth().onAuthStateChanged((user) => {
      if (!user) {
        this.$router.push("/");
      }
    });
  },
  computed: {
    currentTaskComponent() {
      return this.$store.getters.currentTaskSubcomponent;
    },
  },
};
</script>
