<template>
  <el-container>
    <el-header><h1>Your Projects</h1></el-header>
    <el-container>
      <el-aside width="200px"><sidebar-menu></sidebar-menu></el-aside>
      <el-main>
        <component :is="currentProjectComponent"></component>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { getAuth } from "firebase/auth";
import SidebarMenu from "../components/SidebarMenu.vue";
import ProjectTable from "../components/projects/ProjectTable.vue";

export default {
  name: "Projects",
  data() {
    return {};
  },
  components: {
    SidebarMenu,
    ProjectTable,
  },
  methods: {
    changeProjectSubcomponent(sub) {
      this.$store.dispatch("setProjectSubcomponent", {
        subcomponent: sub,
        projectId: null,
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
    currentProjectComponent() {
      return this.$store.getters.currentProjectSubcomponent;
    },
  },
};
</script>
