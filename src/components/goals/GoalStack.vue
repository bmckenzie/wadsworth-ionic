<template>
  <el-form @submit.prevent>
    <draggable v-model="goals" @end="saveGoals">
      <div v-for="goal in goals" :key="goal.id">
        <el-card class="box-card">
          <div class="goal_header">
            <h3>{{ goal.title }}</h3>
          </div>
          <div class="goal_buttons">
            <el-button @click="deleteGoal(goal.id)" type="danger"
              >Delete Goal</el-button
            >
            <el-button @click="viewGoal(goal.id)">View Goal</el-button>
            <el-button @click="editGoal(goal.id)">Edit Goal</el-button>
          </div>
        </el-card>
      </div>
      <!-- <el-button @click="logCurrentGoals">logCurrentGoals</el-button> -->
    </draggable>
  </el-form>
</template>

<script>
import { onBeforeRouteLeave } from "vue-router";
import { ref } from "vue";
import { useStore } from "vuex";
import {
  deleteGoalFromDB,
  saveGoalOrder,
  returnOrderedGoals,
  getOrderOfGoals,
  getListOfGoals,
} from "@/firebaseConfig.js";
import { ElMessageBox } from "element-plus";
import { VueDraggableNext } from "vue-draggable-next";

export default {
  components: {
    draggable: VueDraggableNext,
  },
  setup() {
    onBeforeRouteLeave(() => {
      saveGoals();
      return true;
    });

    const goals = ref([]);
    const store = useStore();
    const userId = store.getters.getUserId;

    // Create goalListener
    const goalListener = {
      removeGoal: function (user, docId) {
        return deleteGoalFromDB(user, docId);
      },
      saveGoals: function (user) {
        return saveGoalOrder(user, goals.value);
      },
      getOrderGoalList: function (user) {
        return getOrderOfGoals(user);
      },

      getListOfGoals: function (user) {
        return getListOfGoals(user);
      },
      returnOrderedListOfGoals: function (user, listOfOrderedGoals) {
        return returnOrderedGoals(user, listOfOrderedGoals);
      },
    };

    try {
      goalListener.getListOfGoals(userId).then((result) => {
        const listOfGoals = result;
        goalListener.getOrderGoalList(userId).then((result) => {
          if (listOfGoals.length === result.goalOrder.length) {
            goalListener
              .returnOrderedListOfGoals(userId, result.goalOrder)
              .then(() => {
                goals.value = result.goalOrder;
              });
          } else {
            goals.value = listOfGoals;
          }
        });
      });
    } catch (error) {
      ElMessageBox.alert(
        "An error has occurred attempting to render the component. " + error,
        "Error",
        {
          confirmButtonText: "OK",
        }
      );
    }

    function deleteGoal(docId) {
      const deletePromise = ElMessageBox(
        "This will delete the goal. Continue?",
        "DANGER!",
        {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      );
      deletePromise.then(() => {
        goalListener.removeGoal(userId, docId);
      });
    }

    function checkMove() {
      console.log("moving on up!");
    }

    function saveGoals() {
      try {
        goalListener.saveGoals(userId, goals.value);
      } catch (error) {
        ElMessageBox.alert(
          "An error occurred saving your goals: " + error,
          "Error",
          {
            confirmButtonText: "OK",
          }
        );
      }
    }

    function logCurrentGoals() {
      console.log(goals.value);
    }

    function editGoal(docId) {
      store.dispatch("setGoalSubcomponent", {
        subcomponent: "EditGoal",
        goalId: docId,
      });
    }

    function viewGoal(docId) {
      store.dispatch("setGoalSubcomponent", {
        subcomponent: "ViewGoal",
        goalId: docId,
      });
    }

    return {
      goals,
      deleteGoal,
      checkMove,
      saveGoals,
      editGoal,
      logCurrentGoals,
      goalListener,
      viewGoal,
    };
  },
};
</script>

<style>
.goal_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.goal_buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
