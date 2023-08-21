<template>
  <h3>Project Table</h3>
  <el-form @submit.prevent>
    <el-row>
      <el-table
        :data="projectsList"
        style="width: 100%"
        max-height="400"
        empty-text="No Projects."
      >
        <el-table-column type="expand" prop="title" label="">
          <template #default="props">
            <p>{{ props.row.description }}</p></template
          >
        </el-table-column>
        <el-table-column label="Title" prop="title"></el-table-column>
        <el-table-column label="Goal" prop="goal"></el-table-column>
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
          :filters="allProjectTags"
          :filter-method="filterTag"
          filter-placement="bottom-end"
        >
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            <el-button size="mini" @click="showProject(scope.row)"
              >Edit</el-button
            >
            <el-button size="mini" @click="deleteProject(scope.row)"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-input
      label="Project Title"
      placeholder="Project Title"
      v-model="projectTitle"
    ></el-input>
    <el-input
      label="Description"
      placeholder="Description"
      type="textarea"
      v-model="projectDescription"
      :autosize="{ minRows: 5 }"
    ></el-input>
    <div>
      <el-row>
        <el-col :span="6"><div>Tags:</div></el-col>
        <el-col :span="6">
          <div>
            <el-tag
              :key="tag"
              v-for="tag in projectTags"
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
        <el-col :span="6"><div>Deadline:</div></el-col>
        <el-col :span="6"
          ><div class="block">
            <el-date-picker
              v-model="projectDeadline"
              type="date"
              placeholder="Pick a day"
              format="MM/DD/YYYY"
              :disabled-date="disabledDate"
              :shortcuts="shortcuts"
            ></el-date-picker></div
        ></el-col>
      </el-row>
      <el-col :span="12">
        <el-button
          :disabled="addDisabled"
          class="new_project__button"
          @click="createProject"
          >Add New Project</el-button
        >
        <el-button
          :disabled="!addDisabled"
          class="save_project__button"
          @click="saveProject"
          >Save Project</el-button
        >
        <el-button
          :disabled="!addDisabled"
          class="cancel_save__button"
          @click="cancelSaveProject"
          >Cancel Edits</el-button
        >
      </el-col>

      <div class="goal__select">
        Goal:
        <el-select v-model="projectGoal" clearable placeholder="Select goal...">
          <el-option
            v-for="goal in allGoals"
            :key="goal.id"
            :label="goal.title"
            :value="goal.id"
          >
          </el-option>
        </el-select>
      </div>

      <el-row>
        <el-col :span="24">
          <h3>Uncompleted Tasks</h3>
          <el-table
            :data="projectTasks"
            style="width: 100%"
            max-height="400"
            empty-text="No Tasks."
          >
            <el-table-column type="expand" prop="title" label="">
              <template #default="props">
                <p>{{ props.row.description }}</p></template
              >
            </el-table-column>
            <el-table-column label="Title" prop="title"></el-table-column>
            <el-table-column>
              <template #default="scope">
                <el-button size="mini" @click="completeTask(scope.row)"
                  >Completed</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24"><h3>Checklists</h3></el-col>
      </el-row>
      <el-table></el-table>
    </div>
  </el-form>
</template>

<script>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import { ElMessageBox } from "element-plus";
import {
  getListOfGoals,
  getOrderOfGoals,
  returnOrderedGoals,
  createNewProject,
  getProjectList,
  updateCurrentProject,
  getAllProjectTags,
  getProject,
  fetchProjectTasks,
  completeTheTask,
} from "@/firebaseConfig.js";
import {
  parseISO,
  formatISO,
  addDays,
  addMonths,
  addQuarters,
  addYears,
} from "date-fns";

export default {
  setup() {
    const store = useStore();
    const projectId = ref("");
    const projectTitle = ref("");
    const projectDescription = ref("");
    const projectTags = ref([]);
    const projectGoal = ref("");
    const allProjectTags = ref([]);
    const tmpTag = ref("");
    const inputVisible = ref(false);
    const saveTagInput = ref(null);
    const search = ref("");
    const allGoals = ref([]);
    const projectTasks = ref([]);
    const projectDeadline = ref("");
    const projectChecklists = ref([]);
    const addDisabled = ref(false);
    const userId = store.getters.getUserId;
    const projectsList = ref([]);
    const deadlineTimeObject = ref("");

    // Calendar shortcuts
    const shortcuts = [
      {
        text: "In A Week",
        value: (() => {
          const date = new Date();
          const week = addDays(date, 7);
          return formatISO(week);
        })(),
      },
      {
        text: "In A Month",
        value: (() => {
          const date = new Date();
          const month = addMonths(date, 1);
          return formatISO(month);
        })(),
      },
      {
        text: "Next Quarter",
        value: (() => {
          const date = new Date();
          const quarter = addQuarters(date, 1);
          return formatISO(quarter);
        })(),
      },
      {
        text: "Next Year",
        value: (() => {
          const date = new Date();
          const year = addYears(date, 1);
          return formatISO(year);
        })(),
      },
    ];

    // Create listener
    const projectListener = {
      getOrderGoalList: function (user) {
        return getOrderOfGoals(user);
      },
      getListOfGoals: function (user) {
        return getListOfGoals(user);
      },
      returnOrderedListOfGoals: function (user, listOfOrderedGoals) {
        return returnOrderedGoals(user, listOfOrderedGoals);
      },
      newProject: function (user, projectObject) {
        return createNewProject(user, projectObject);
      },
      getListOfProjects: function (user) {
        return getProjectList(user);
      },
      updateProject: function (user, docId, projectObject) {
        return updateCurrentProject(user, docId, projectObject);
      },
      fetchTags: function (user) {
        return getAllProjectTags(user);
      },
      fetchProject: function (user, docId) {
        return getProject(user, docId);
      },
      getProjectTasks: function (user, docId) {
        return fetchProjectTasks(user, docId);
      },
      completeTask: function (user, taskId) {
        return completeTheTask(user, taskId);
      },
    };

    async function getGoalList() {
      projectListener.getListOfGoals(userId).then((result) => {
        const listOfGoals = result;
        projectListener.getOrderGoalList(userId).then((result) => {
          if (listOfGoals.length === result.goalOrder.length) {
            projectListener
              .returnOrderedListOfGoals(userId, result.goalOrder)
              .then(() => {
                allGoals.value = result.goalOrder;
              });
          } else {
            allGoals.value = listOfGoals;
          }
        });
      });
    }

    async function updateProjectList() {
      const tmpProjectList = await projectListener
        .getListOfProjects(userId)
        .then((result) => {
          return result;
        });
      const assignToList = async () => {
        const tempArray = await tmpProjectList;
        // const dedupedArray = uniq(tempArray, "id"); <- lodash

        // const dedupedArray = [...new Set(tempArray)];

        // const dedupedArray = tempArray.filter((data, index) => {
        //   return tempArray.indexOf(data) === index;
        // });

        // const dedupedArray = tempArray.reduce((acc, item) => {
        //   if (!acc.includes(item)) {
        //     acc.push(item);
        //   }
        //   return acc;
        // }, []);

        // const holder = tempArray.map((item) => {
        //   return [item.id, item];
        // });
        // const maparr = new Map(holder);
        // const dedupedArray = [...maparr.values()];

        // const setObj = new Set();
        // const dedupedArray = tempArray.reduce((acc, item) => {
        //   if (+setObj.has(item.id)) {
        //     setObj.add(item.id, item);
        //     acc.push(item);
        //   }
        //   return acc;
        // },[]);

        projectsList.value = tempArray;
      };
      assignToList();
    }

    onMounted(async () => {
      updateProjectList();
      getTags();
      if (store.getters.currentProjectId !== "") {
        addDisabled.value = true;
        loadProject(store.getters.currentProjectId);
      }
      getGoalList();
    });
    // try {
    //   projectListener.getListOfProjects(userId).then((result) => {
    //     projectsList.value = result;
    //     console.log(projectsList.value);
    //   });
    // } catch (error) {
    //   ElMessageBox.alert(
    //     "An error has occurred attempting to render the component. " + error,
    //     "Error",
    //     {
    //       confirmButtonText: "OK",
    //     }
    //   );
    // }

    async function loadProject(projectIdValue) {
      console.log(store.getters.currentProjectId);
      projectId.value = projectIdValue;
      const tmpProject = await projectListener.fetchProject(
        userId,
        projectIdValue
      );
      projectTitle.value = tmpProject.title;
      projectDescription.value = tmpProject.description;
      projectGoal.value = tmpProject.connectedGoal;
      projectTags.value = tmpProject.tags;
      projectDeadline.value = tmpProject.deadline;
      projectChecklists.value = tmpProject.connectedChecklists;
    }

    function showProject(row) {
      addDisabled.value = true;
      projectId.value = row.id;
      projectTitle.value = row.title;
      projectDescription.value = row.description;
      projectGoal.value = row.connectedGoal;
      projectTags.value = row.tags;
      if (row.deadline !== null && row.deadline !== "") {
        if (row.deadline.seconds) {
          projectDeadline.value = formatISO(row.deadline.seconds * 1000);
        } else {
          projectDeadline.value = parseISO(row.deadline);
        }
      } else {
        projectDeadline.value = "";
      }
      // projectDeadline.value = formatISO(row.deadline);
      // getTasks(userId, row.id);
      projectChecklists.value = row.connectedChecklists;
      getTasks(userId, row.id);
    }

    function deleteProject(docId) {
      console.log(docId);
    }

    function completeTask(row) {
      projectListener.completeTask(userId, row.id);
    }

    function createProject() {
      if (projectTitle.value === "") {
        ElMessageBox.alert("Project must have a title!", "Error", {
          confirmButtonText: "OK",
        });
      }
      const tmpProject = {
        id: projectId.value,
        title: projectTitle.value,
        description: projectDescription.value,
        deadline: projectDeadline.value,
        tags: projectTags.value,
        connectedChecklists: projectChecklists.value,
        connectedGoal: projectGoal.value,
        connectedTasks: projectTasks.value,
        timeCreated: new Date().getTime(),
      };
      projectListener.newProject(userId, tmpProject).catch((error) => {
        ElMessageBox.alert("Error creating new project: " + error, "Error", {
          confirmButtonText: "OK",
        });
      });
      addDisabled.value = false;
      projectId.value = "";
      projectTitle.value = "";
      projectDescription.value = "";
      projectGoal.value = "";
      projectTags.value = [];
      projectDeadline.value = "";
      projectChecklists.value = [];
      deadlineTimeObject.value = "";
      updateProjectList();
    }

    function handleClose(newTag) {
      projectTags.value.splice(projectTags.value.indexOf(newTag), 1);
    }

    function showInput() {
      inputVisible.value = true;
    }

    function handleInputConfirm() {
      let inputValue = tmpTag.value;
      if (projectTags.value.includes(tmpTag.value)) {
        ElMessageBox.alert("Tags must be unique!", "Error", {
          confirmButtonText: "OK",
        });
      } else {
        if (inputValue) {
          projectTags.value.push(inputValue);
        }
        tmpTag.value = "";
      }
    }
    function disabledDate(time) {
      return time.getTime() < Date.now();
    }

    function saveProject() {
      if (projectTitle.value === "") {
        ElMessageBox.alert("Project must have a title!", "Error", {
          confirmButtonText: "OK",
        });
      }
      deadlineTimeObject.value = "";
      if (projectDeadline.value === null) {
        projectDeadline.value = "";
      } else {
        deadlineTimeObject.value = projectDeadline.value;
      }
      const tmpProjectObject = {
        title: projectTitle.value,
        description: projectDescription.value,
        deadline: deadlineTimeObject.value,
        tags: projectTags.value,
        connectedChecklists: projectChecklists.value,
        connectedGoal: projectGoal.value,
        connectedTasks: projectTasks.value,
      };
      projectListener.updateProject(userId, projectId.value, tmpProjectObject);
      addDisabled.value = false;
      projectId.value = "";
      projectTitle.value = "";
      projectDescription.value = "";
      projectGoal.value = "";
      projectTags.value = [];
      projectDeadline.value = "";
      projectChecklists.value = [];
      deadlineTimeObject.value = "";
      store.commit("setProjectId", { projectId: "" });
      updateProjectList();
    }

    function cancelSaveProject() {
      addDisabled.value = false;
      projectId.value = "";
      projectTitle.value = "";
      projectDescription.value = "";
      projectGoal.value = "";
      projectTags.value = [];
      projectDeadline.value = "";
      projectChecklists.value = [];
      deadlineTimeObject.value = "";
      store.commit("setProjectId", { projectId: "" });
      updateProjectList();
    }

    function filterTag(value, row) {
      console.log(row.tags);
      const containsTag = Object.values(row.tags).includes(value);
      if (containsTag) {
        return row.tags;
      }
    }

    async function getTags() {
      const tmpProjectList = await projectListener
        .fetchTags(userId)
        .then((result) => {
          return result;
        });
      const assignToList = async () => {
        const tempArray = await tmpProjectList;
        allProjectTags.value = tempArray;
      };
      assignToList();
    }

    async function getTasks(user, docId) {
      const tmpTaskList = await projectListener
        .getProjectTasks(user, docId)
        .then((result) => {
          return result;
        });
      const assignToList = async () => {
        const tempArray = await tmpTaskList;
        projectTasks.value = tempArray;
        console.log(projectTasks.value);
      };
      assignToList();
    }

    return {
      projectsList,
      showProject,
      deleteProject,
      createProject,
      projectTitle,
      projectDescription,
      projectTags,
      allProjectTags,
      handleClose,
      handleInputConfirm,
      inputVisible,
      showInput,
      saveTagInput,
      tmpTag,
      search,
      projectTasks,
      projectDeadline,
      disabledDate,
      shortcuts,
      projectGoal,
      allGoals,
      projectListener,
      addDisabled,
      saveProject,
      projectChecklists,
      cancelSaveProject,
      filterTag,
      getTags,
      getTasks,
      completeTask,
    };
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
