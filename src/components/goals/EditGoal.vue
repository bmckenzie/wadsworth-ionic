<template>
  <h3>Edit Goal</h3>
  <el-form>
    <el-form-item label="Goal Title">
      <el-input v-model="goalTitle"></el-input>
    </el-form-item>
    <draggable v-model="sections" @end="saveTmpSections">
      <div v-for="(section, index) in sections" :key="index" class="section">
        <el-card class="box-card">
          <div class="card-header">
            <span
              ><h3>{{ section.title }}</h3></span
            >
            <el-button type="danger" @click="deleteSection(index)"
              >Delete Section</el-button
            >
            <el-button type="primary" @click="editSection(index)">
              Edit Section</el-button
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
    <el-button type="danger" @click="cancelEditGoal">Back</el-button>
    <el-button type="default" v-if="!addSaveToggle" @click="addSection"
      >Add Section</el-button
    >
    <el-button v-else type="default" @click="saveSection"
      >Save Section</el-button
    >
    <el-button type="success" @click="saveGoalFromTmp">Save Goal</el-button>
  </el-form>
</template>

<script>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import { getGoal, saveGoal, loadSection } from "@/firebaseConfig.js";
import { ElMessageBox } from "element-plus";
import { VueDraggableNext } from "vue-draggable-next";

export default {
  name: "EditGoal",
  components: {
    draggable: VueDraggableNext,
  },
  setup() {
    const store = useStore();
    const sections = ref([]);
    const tempSectionTitle = ref("");
    const tempDescription = ref("");
    const goalTitle = ref("");
    const addSaveToggle = ref(false);
    const tmpIndex = ref("");

    // Goal Listener
    const goalListener = {
      returnGoal: function (user, docId) {
        return getGoal(user, docId);
      },
      saveGoal: function (user, docId, newGoal) {
        return saveGoal(user, docId, newGoal);
      },
      loadSection: function (user, docId) {
        return loadSection(user, docId);
      },
    };

    function editGoal() {
      goalListener
        .returnGoal(store.getters.getUserId, store.state.goals.goalId)
        .then((result) => {
          goalTitle.value = result.title;
          sections.value = result.sections;
        });
    }

    function addSection() {
      sections.value.push({
        title: tempSectionTitle.value,
        description: tempDescription.value,
      });
    }

    function addOrSaveSection() {
      if (tmpIndex.value !== "") {
        addSection();
      } else {
        saveSection();
      }
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
    function cancelEditGoal() {
      const leaveEditPromise = ElMessageBox.confirm(
        "All unsaved changes will be lost. Continue?",
        "Warning",
        {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      );
      leaveEditPromise.then(() => {
        store.dispatch("setGoalSubcomponent", {
          subcomponent: "GoalStack",
          goalId: null,
        });
      });
    }

    function editSection(index) {
      addSaveToggle.value = true;
      tmpIndex.value = index;
      console.log(index);
      goalListener.returnGoal(
        store.getters.getUserId,
        store.state.goals.goalId
      );
      goalListener
        .loadSection(store.getters.getUserId, store.getters.currentGoalId)
        .then((result) => {
          tempSectionTitle.value = result.sections[index].title;
          tempDescription.value = result.sections[index].description;
        });
    }

    function saveSection() {
      console.log(sections.value);
      console.log(tmpIndex.value);
      sections.value.splice(tmpIndex.value, 1, {
        title: tempSectionTitle.value,
        description: tempDescription.value,
      });
      tmpIndex.value = "";
      addSaveToggle.value = false;
    }

    function saveGoalFromTmp() {
      if (goalTitle.value !== "") {
        try {
          const newGoalToSave = {
            title: goalTitle.value,
            sections: sections.value,
          };
          goalListener
            .saveGoal(
              store.getters.getUserId,
              store.getters.currentGoalId,
              newGoalToSave
            )
            .then(() => {
              ElMessageBox.alert("Goal has been saved.", "Success", {
                confirmButtonText: "OK",
              });
            })
            .catch((error) => {
              ElMessageBox.alert("An error occured: " + error, "Error", {
                confirmButtonText: "OK",
              });
            });
        } catch (e) {
          console.log(e);
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

    onMounted(() => {
      const tmp = store.getters.currentGoalId;
      console.log(tmp);
      editGoal();
    });

    function saveTmpSections() {
      const tempTitle = goalTitle.value;
      const sectionsToSave = {
        title: tempTitle,
        sections: sections.value,
      };
      goalListener.saveGoal(
        store.getters.getUserId,
        store.getters.currentGoalId,
        sectionsToSave
      );
    }

    return {
      sections,
      addOrSaveSection,
      addSection,
      deleteSection,
      cancelEditGoal,
      saveGoalFromTmp,
      goalTitle,
      tempSectionTitle,
      tempDescription,
      editSection,
      saveTmpSections,
      saveSection,
      addSaveToggle,
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
