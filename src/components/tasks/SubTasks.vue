<template>
  <el-form @submit.prevent>
    <el-row>
      <el-table
        :data="
          tasksList.filter(
            (data) =>
              !search || data.title.toLowerCase().includes(search.toLowerCase())
          )
        "
        empty-text="No Tasks"
        stripe
        max-height="800px"
      >
        <el-table-column type="expand" prop="prop" label=""
          ><template #default="props">
            <p>{{ props.row.description }}</p></template
          ></el-table-column
        >
        <el-table-column
          label="Title"
          prop="title"
          width="300"
        ></el-table-column>
        <el-table-column>
          <template #header>
            <el-input
              v-model="search"
              size="mini"
              placeholder="Project search"
              width="100"
            >
            </el-input>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          label="Completed"
          filterable
          :filters="[
            { text: 'Completed', value: true },
            { text: 'To Do', value: false },
          ]"
          :filter-method="filterCompleted"
          filter-placement="bottom-end"
        ></el-table-column>
        <el-table-column>
          <template #default="scope">
            <i v-if="scope.row.completed" class="el-icon-folder-checked"></i>
            <i v-else class="el-icon-folder"></i>
          </template>
        </el-table-column>
        <el-table-column label="Tags" prop="tag">
          <template #default="scope">
            <div class="table-tag">
              <div v-for="(tag, index) in scope.row.tags" :key="index">
                <el-tag>{{ tag }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="right"
          prop="tag"
          label="Filter By Tag"
          :filters="allTaskTags"
          :filter-method="filterTag"
          filter-placement="bottom-end"
        >
        </el-table-column>
        <el-table-column> </el-table-column>
        <el-table-column>
          <template #default="scope">
            <el-button
              v-if="!scope.row.completed"
              size="mini"
              @click="completeTask(scope.row)"
              >Completed</el-button
            >
            <el-button v-else size="mini" @click="reactivateTask"
              >Reactivate</el-button
            >
            <el-button size="mini" @click="showTask(scope.row)">Edit</el-button>
            <el-button size="mini" @click="deleteTask(scope.row)"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-row>
      <el-input
        label="Task Title"
        placeholder="Task Title"
        v-model="taskTitle"
      ></el-input>
      <el-input
        label="Description"
        placeholder="Description"
        type="textarea"
        v-model="taskDescription"
        :autosize="{ minRows: 5 }"
      ></el-input>
    </el-row>
    <div>
      <el-row>
        <el-col :span="6"><div>Tags:</div></el-col>
        <el-col :span="6">
          <div>
            <el-tag
              :key="tag"
              v-for="tag in taskTags"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-model="tmpTag"
              v-if="inputVisible"
              ref="saveTagInput"
              size="mini"
              @keyup.enter="handleInputConfirm"
            >
            </el-input>
            <el-button
              v-else
              class="button-new-tag"
              size="mini"
              @click="showInput"
              >+ New Tag</el-button
            >
          </div>
        </el-col>
      </el-row>
    </div>
    <el-col :span="12">
      <el-button
        :disabled="addDisabled"
        class="new_project__button"
        @click="createTask"
        >Add New Task</el-button
      >
      <el-button
        :disabled="!addDisabled"
        class="save_project__button"
        @click="saveTask"
        >Save Task</el-button
      >
      <el-button
        :disabled="!addDisabled"
        class="cancel_save__button"
        @click="cancelSaveTask"
        >Cancel Edits</el-button
      >
    </el-col>

    <div class="task__select">
      Project:
      <el-select
        v-model="taskProject"
        clearable
        placeholder="Select project..."
      >
        <el-option
          v-for="project in allProjects"
          :key="project.id"
          :label="project.title"
          :value="project.id"
        >
        </el-option>
      </el-select>
    </div>
  </el-form>
</template>

<script>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import {
  addTask,
  getTasksList,
  updateCurrentTask,
  getAllProjectsList,
  completeTheTask,
  fetchAllTaskTags,
  makeTaskActive,
} from "@/firebaseConfig";
import { ElMessageBox } from "element-plus";

export default {
  name: "SubTasks",
  setup() {
    const taskId = ref("");
    const tasksList = ref([]);
    const addDisabled = ref(false);
    const taskTitle = ref("");
    const taskDescription = ref("");
    const taskCompleted = ref(false);
    const taskTags = ref([]);
    const allTaskTags = ref([]);
    const allProjects = ref([]);
    const taskProject = ref("");
    const inputVisible = ref(false);
    const showCompleted = ref(false);
    const store = useStore();
    const userId = store.getters.getUserId;
    const tmpTag = ref("");
    const search = ref("");

    // Task Listener

    const taskListener = {
      addNewTask: function (user, taskToAdd) {
        return addTask(user, taskToAdd);
      },
      getTasks: function (user) {
        return getTasksList(user);
      },
      updateTask: function (user, taskId, taskToUpdate) {
        return updateCurrentTask(user, taskId, taskToUpdate);
      },
      getProjectList: function (user) {
        return getAllProjectsList(user);
      },
      completeTask: function (user, taskId) {
        return completeTheTask(user, taskId);
      },
      getAllTaskTags: function (user) {
        return fetchAllTaskTags(user);
      },
      uncompleteTask: function (user, taskId) {
        return makeTaskActive(user, taskId);
      },
    };

    function filterProject() {
      console.log("filterProject called");
    }

    function filterTag(value, row) {
      const containsTag = Object.values(row.tags).includes(value);
      if (containsTag) {
        return row.tags;
      }
    }

    function filterCompleted(value, row) {
      console.log(value);
      console.log(row);
      return row.completed === value;
    }

    function completeTask(row) {
      taskListener.completeTask(userId, row.id);
    }

    function reactivateTask(row) {
      taskListener.uncompleteTask(userId, row.id);
    }

    function showTask(row) {
      console.log(row);
      addDisabled.value = true;
      taskId.value = row.id;
      taskTitle.value = row.title;
      taskDescription.value = row.description;
      taskCompleted.value = row.completed;
      taskTags.value = row.tags;
      taskProject.value = row.connectedProject;
    }

    function deleteTask(row) {
      console.log(row);
    }

    function handleClose(tag) {
      taskTags.value.splice(taskTags.value.indexOf(tag), 1);
    }

    function handleInputConfirm() {
      let inputValue = tmpTag.value;
      if (taskTags.value.includes(tmpTag.value)) {
        ElMessageBox.alert("Tags must be unique!", "Error", {
          confirmButtonText: "OK",
        });
      } else {
        if (inputValue) {
          taskTags.value.push(inputValue);
        }
        tmpTag.value = "";
      }
    }

    function showInput() {
      inputVisible.value = true;
    }

    function createTask() {
      if (taskTitle.value === "") {
        ElMessageBox.alert("Tasks must contain a title!", "Error", {
          confirmButtonText: "OK",
        });
      } else {
        const tmpTaskObject = {
          title: taskTitle.value,
          description: taskDescription.value,
          completed: false,
          tags: taskTags.value,
          connectedProject: taskProject.value,
          timeCreated: new Date().getTime(),
        };
        taskListener.addNewTask(userId, tmpTaskObject);
        taskTitle.value = "";
        taskDescription.value = "";
        taskCompleted.value = false;
        taskTags.value = [];
        taskProject.value = "";
      }
      updateTasksList();
    }

    function saveTask() {
      if (taskTitle.value === "") {
        ElMessageBox.alert("Project must have a title!", "Error", {
          confirmButtonText: "OK",
        });
      }
      const tempTaskObject = {
        title: taskTitle.value,
        description: taskDescription.value,
        completed: taskCompleted.value,
        tags: taskTags.value,
        connectedProject: taskProject.value,
      };
      taskListener.updateTask(userId, taskId.value, tempTaskObject);
      taskId.value = "";
      taskTitle.value = "";
      taskDescription.value = "";
      taskCompleted.value = false;
      taskTags.value = [];
      taskProject.value = "";
      updateTasksList();
      addDisabled.value = false;
    }

    function cancelSaveTask() {
      addDisabled.value = false;
      taskTitle.value = "";
      taskDescription.value = "";
      taskCompleted.value = false;
      taskTags.value = [];
      taskProject.value = "";
    }

    function completedChanged() {
      console.log("completedChanged called");
    }

    async function updateTasksList() {
      const tmpTaskList = await taskListener.getTasks(userId).then((result) => {
        return result;
      });
      const assignToList = async () => {
        const tempArray = await tmpTaskList;
        tasksList.value = tempArray;
      };
      assignToList();
    }

    async function updateAllTagsList() {
      const tmpTaskTags = await taskListener
        .getAllTaskTags(userId)
        .then((result) => {
          return result;
        });
      const assignToList = async () => {
        const tempArray = await tmpTaskTags;
        allTaskTags.value = tempArray;
      };
      assignToList();
    }

    async function updateProjectList() {
      const tmpProjectList = await taskListener
        .getProjectList(userId)
        .then((result) => {
          return result;
        });
      const assignToList = async () => {
        const tempArray = await tmpProjectList;
        allProjects.value = tempArray;
        console.log(allProjects.value);
      };
      assignToList();
    }

    onMounted(() => {
      updateTasksList();
      updateProjectList();
      updateAllTagsList();
    });

    return {
      tasksList,
      filterProject,
      filterTag,
      filterCompleted,
      completeTask,
      showTask,
      deleteTask,
      addDisabled,
      taskTitle,
      taskDescription,
      taskTags,
      handleClose,
      handleInputConfirm,
      showInput,
      createTask,
      saveTask,
      cancelSaveTask,
      allProjects,
      taskProject,
      inputVisible,
      showCompleted,
      taskCompleted,
      completedChanged,
      tmpTag,
      allTaskTags,
      updateAllTagsList,
      search,
      reactivateTask,
    };
  },
};
</script>

<style></style>
