<template>
  <h3>New Goal</h3>
  <el-form>
    <el-form-item label="Goal Title">
      <el-input id="goalTitleRef" v-model="goalTitle"></el-input>
    </el-form-item>
    <draggable v-model="sections" :move="checkMove">
      <div v-for="(section, index) in sections" :key="index" class="section">
        <el-card class="box-card">
          <div class="card-header">
            <span
              ><h3>{{ section.title }}</h3></span
            >
            <el-button type="danger" @click="deleteSection"
              >Delete Section</el-button
            >
          </div>
          <div class="text item">
            <p>{{ section.description }}</p>
          </div>
        </el-card>
      </div>
    </draggable>
    <el-form-item label="Section Title">
      <el-input v-model="tempSectionTitle"></el-input>
    </el-form-item>
    <el-form-item label="Description">
      <el-input type="textarea" v-model="tempDescription"></el-input>
    </el-form-item>
    <el-button type="danger" @click="cancelNewGoal">Back</el-button>
    <el-button @click="addSection">Add Section</el-button>
    <el-button @click="createNewGoalFromTemp" type="success"
      >Save Goal</el-button
    >
  </el-form>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";
import { createNewGoal } from "@/firebaseConfig.js";
import { ElMessageBox } from "element-plus";
import { VueDraggableNext } from "vue-draggable-next";

export default {
  name: "NewGoal",
  components: {
    draggable: VueDraggableNext,
  },
  setup() {
    const store = useStore();

    const sections = ref([]);
    const tempSectionTitle = ref("");
    const tempDescription = ref("");
    const goalTitle = ref("");

    function addSection() {
      sections.value.push({
        title: tempSectionTitle.value,
        description: tempDescription.value,
      });
    }

    function deleteSection(index) {
      const deleteSelectionPromise = ElMessageBox.confirm(
        "This will permanently delete this section. This cannot be undone.",
        "Warning",
        {
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      );
      deleteSelectionPromise.then(() => {
        sections.value.splice(index, 1);
      });
      deleteSelectionPromise.catch(() => {
        // cancelled; do nothing
      });
    }

    function cancelNewGoal() {
      store.dispatch("setGoalSubcomponent", {
        subcomponent: "GoalStack",
        goalId: null,
      });
    }

    function createNewGoalFromTemp() {
      const currentUser = store.getters.getUserId;
      if (goalTitle.value !== "") {
        try {
          const tmpGoalObject = {
            title: goalTitle.value,
            sections: sections.value,
          };
          createNewGoal(currentUser, tmpGoalObject);
          tempSectionTitle.value = "";
          tempDescription.value = "";
          goalTitle.value = "";
          sections.value = [];
        } catch (e) {
          console.log(e);
          ElMessageBox.alert("An error occurred: " + e, "Error", {
            confirmButtonText: "OK",
          });
        }
      } else {
        ElMessageBox.alert("You must enter a title for your goal!", "", {
          confirmButtonText: "OK",
          callback: () => {
            document.getElementById("goalTitleRef").focus();
          },
        });
      }
    }

    function checkMove(evt) {
      console.log("Future index: " + evt.draggedContext.futureIndex);
      console.log("element" + evt.draggedContext.element.name);
    }

    return {
      sections,
      addSection,
      deleteSection,
      cancelNewGoal,
      createNewGoalFromTemp,
      goalTitle,
      tempSectionTitle,
      tempDescription,
      checkMove,
    };
  },
};
</script>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
