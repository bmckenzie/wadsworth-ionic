<template>
  <h3>{{ currentGoal.title }}</h3>
  <draggable v-model="currentSections">
    <div v-for="(section, index) in currentSections" :key="index">
      <el-row>
        <el-col :span="24">
          <el-card class="box-card">
            <div class="card-header">
              <span
                ><h3>{{ section.title }}</h3></span
              >
            </div>
            <div class="text item">
              <p>{{ section.description }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </draggable>
  <el-row>
    <el-col :span="24">
      <h3>Linked Projects</h3>
      <el-table :data="linkedProjects" empty-text="No linked projects found">
        <el-table-column type="expand">
          <template #default="props">
            <p>{{ props.row.description }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Projects">
          <template #default="scope">
            <span>{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            <el-button
              size="mini"
              @click="editProject(scope.row.id)"
              type="success"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24"
      ><el-button @click="backToGoals">Back To Goals</el-button>
      <el-button @click="editGoal" type="success">Edit Goal</el-button></el-col
    ></el-row
  >
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { getGoal, getProjectsLinkedToGoal } from "@/firebaseConfig";
import { VueDraggableNext } from "vue-draggable-next";

export default {
  components: {
    draggable: VueDraggableNext,
  },
  setup() {
    const store = useStore();
    const userId = store.getters.getUserId;
    const goalId = store.getters.currentGoalId;
    const currentGoal = ref({});
    const currentSections = ref([]);
    const linkedProjects = ref([]);
    const router = useRouter();

    // create ViewGoal listener
    const goalListener = {
      returnGoal: function (userId, goalId) {
        return getGoal(userId, goalId);
      },
      fetchProjects: function (userId, goalId) {
        return getProjectsLinkedToGoal(userId, goalId);
      },
    };

    function backToGoals() {
      store.dispatch("setGoalSubcomponent", {
        subcomponent: "GoalStack",
        goalId: null,
      });
    }

    async function fetchGoal() {
      currentGoal.value = await goalListener.returnGoal(userId, goalId);
      currentSections.value = currentGoal.value.sections;
    }

    function editGoal() {
      store.dispatch("setGoalSubcomponent", {
        subcomponent: "EditGoal",
        goalId: store.getters.currentGoalId,
      });
    }

    function editProject(projectId) {
      store.commit("setProjectId", { projectId: projectId });
      router.push("/projects");
    }

    async function fetchProjects() {
      linkedProjects.value = await goalListener.fetchProjects(userId, goalId);
    }

    onMounted(() => {
      fetchGoal();
      fetchProjects();
    });

    return {
      backToGoals,
      fetchGoal,
      currentGoal,
      currentSections,
      linkedProjects,
      editGoal,
      fetchProjects,
      editProject,
    };
  },
};
</script>

<style></style>
