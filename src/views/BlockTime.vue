<template>
  <el-container>
    <el-container>
      <el-aside width="200px"><sidebar-menu></sidebar-menu></el-aside>
      <el-main>
        <block-time-component></block-time-component>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import SidebarMenu from "../components/SidebarMenu.vue";
import BlockTimeComponent from "../components/blockTime/BlockTimeComponent.vue";

export default {
  components: {
    SidebarMenu,
    BlockTimeComponent,
  },
  data() {
    return {};
  },
};
</script>
