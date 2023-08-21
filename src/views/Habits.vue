<template>
  <el-container>
    <el-container>
      <el-aside width="200px"><sidebar-menu></sidebar-menu></el-aside>
      <el-main>
        <sub-habits></sub-habits>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import SidebarMenu from "../components/SidebarMenu.vue";
import SubHabits from "../components/habits/SubHabits.vue";

export default {
  components: {
    SidebarMenu,
    SubHabits,
  },
  data() {
    return {};
  },
};
</script>
