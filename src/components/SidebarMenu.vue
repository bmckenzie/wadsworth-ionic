<template>
  <!-- eslint-disable -->
  <el-menu
    class="el-menu-vertical"
    :router="true">
    <el-menu-item index="dashboard">
      <font-awesome-icon :icon="['fas', 'home']">
      </font-awesome-icon>
      Dashboard
    </el-menu-item>
    <el-menu-item index="goals">
      <font-awesome-icon :icon="['fas', 'bullseye']">
      </font-awesome-icon>
      Goals
      </el-menu-item>
      <el-menu-item index="roles">
        <font-awesome-icon :icon="['fas', 'users']">
        </font-awesome-icon>
        Roles
      </el-menu-item>
    <el-menu-item index="projects">
      <font-awesome-icon :icon="['fas', 'project-diagram']">
      </font-awesome-icon>
      Projects
      </el-menu-item>
    <el-menu-item index="tasks">
      <font-awesome-icon :icon="['fas', 'tasks']">
      </font-awesome-icon>
      Tasks
      </el-menu-item>
    <el-menu-item index="block">
      <font-awesome-icon :icon="['fas', 'history']">
      </font-awesome-icon>
      Block Time
    </el-menu-item>
    <el-menu-item index="habits">
      <font-awesome-icon :icon="['fas', 'user-clock']">
      </font-awesome-icon>
      Habits
    </el-menu-item>
    <el-menu-item index="checklists">
      <font-awesome-icon :icon="['fas', 'check-square']">
        </font-awesome-icon>
        Checklists
      </el-menu-item>
    <el-menu-item index="logs">
      <font-awesome-icon :icon="['fa', 'clipboard-list']">
        </font-awesome-icon>
        Logs
        </el-menu-item>
    <el-menu-item index="notes">
      <font-awesome-icon :icon="['fas', 'sticky-note']">
        </font-awesome-icon>
        Notes
    </el-menu-item>
    <el-menu-item>
      <font-awesome-icon :icon="['fas', 'heart']">
        </font-awesome-icon>
        Life Events
    </el-menu-item>
    <el-menu-item @click="logoutUser">
      <font-awesome-icon :icon="['fas', 'sign-out-alt']">
      </font-awesome-icon>
      Logout
    </el-menu-item>
  </el-menu>
</template>

<script>
import { getAuth } from "firebase/auth";

export default {
  data() {
    return {};
  },
  methods: {
    logoutUser() {
      getAuth()
        .signOut()
        .then(() => {
          getAuth().onAuthStateChanged(() => this.$router.push("/"));
        });
    },
  },
};
</script>

<style>
.el-menu-vertical {
  width: 190px;
  top: 0px;
  left: 0px;
  position: absolute;
}
</style>
