<template>
  <h2>Your Habits</h2>
  <table>
    <thead>
      <th class="title">Habit</th>
      <th v-for="(header, index) in tableHeader" :key="index">
        {{ header.date }}
      </th>
      <tr>
        <div v-for="(habit, parent_index) in habitsList" :key="parent_index">
          <td>
            {{ habit.title }}
          </td>
          <td v-for="(timestamp, index) in timestampWeekDates" :key="index">
            <input
              v-model="checkedBoxes"
              :value="habit.id + '_' + timestamp"
              type="checkbox"
            />
          </td>
        </div>
      </tr>
    </thead>
  </table>
  <el-input placeholder="Title of habit" v-model="habitTitle"></el-input>
  <el-button @click="addHabit">Add Habit</el-button>
  <el-button @click="saveHabits">Save Habit Log</el-button>
</template>

<script>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import { startOfWeek, addDays, lightFormat, getUnixTime } from "date-fns";
import {
  saveHabitsDB,
  loadHabitsListDB,
  loadHabitsLogDB,
} from "@/firebaseConfig.js";
import { uuid } from "vue-uuid";

export default {
  name: "SubHabits",
  setup() {
    const startDate = ref(new Date());
    const weekDates = ref([]);
    const timestampWeekDates = ref([]);
    const tableData = ref();
    const habitTitle = ref("");
    const tmpHabitLogs = ref({});
    const habitData = ref([]);
    const tableHeader = ref([]);
    const tmpHabit = ref({});
    const logForTheWeek = ref([]);
    const store = useStore();
    const userId = store.getters.getUserId;
    const habitsList = ref([]);
    const currentTimestamp = ref("");
    const checkedHabit = ref("");
    const checkedBoxes = ref([]);
    const savedHabits = ref([]);

    // Habit listener

    const habitListener = {
      saveHabits: function (userId, habitsToSave, habitsToDelete) {
        return saveHabitsDB(userId, habitsToSave, habitsToDelete);
      },
      loadHabits: function (userId) {
        return loadHabitsListDB(userId);
      },
      getHabitLog: function () {
        return loadHabitsLogDB(userId, timestampWeekDates.value);
      },
    };

    // Time functions... like MAGIC!

    function getStartOfWeek(date) {
      if (date === undefined) {
        const todaysDate = new Date();
        return startOfWeek(todaysDate, { weekStartsOn: 1 });
      } else {
        const daySelected = date;
        return startOfWeek(daySelected, { weekStartsOn: 1 });
      }
    }

    function generateWeekDates(date) {
      const tmpWeekArray = [];
      const tmpTimestampArray = [];
      const startOfWeekDate = getStartOfWeek(date);
      for (let i = 0; i < 7; i = i + 1) {
        tmpTimestampArray.push(getUnixTime(addDays(startOfWeekDate, i)));
        tmpWeekArray.push(lightFormat(addDays(startOfWeekDate, i), "MM/dd/yy"));
      }
      timestampWeekDates.value = tmpTimestampArray;
      weekDates.value = tmpWeekArray;
    }

    function updateTableDates() {
      const formattedDate = new Date(startDate.value);
      generateWeekDates(formattedDate);
      buildHeadersForTable(timestampWeekDates.value, weekDates.value);
    }

    // Building the header of dates for the table
    function buildHeadersForTable(timestamps, dates) {
      const dateArray = [];
      timestamps.forEach((element, index) => {
        const tmpObject = { timestamp: element, date: dates[index] };
        switch (index) {
          case 0: {
            dateArray.push(tmpObject);
            dateArray[0].date = "Mon " + dateArray[0].date;
            break;
          }
          case 1: {
            dateArray.push(tmpObject);
            dateArray[1].date = "Tue " + dateArray[1].date;
            break;
          }
          case 2: {
            dateArray.push(tmpObject);
            dateArray[2].date = "Wed " + dateArray[2].date;
            break;
          }
          case 3: {
            dateArray.push(tmpObject);
            dateArray[3].date = "Thu " + dateArray[3].date;
            break;
          }
          case 4: {
            dateArray.push(tmpObject);
            dateArray[4].date = "Fri " + dateArray[4].date;
            break;
          }
          case 5: {
            dateArray.push(tmpObject);
            dateArray[5].date = "Sat " + dateArray[5].date;
            break;
          }
          case 6: {
            dateArray.push(tmpObject);
            dateArray[6].date = "Sun " + dateArray[6].date;
            break;
          }
        }
        tableHeader.value = dateArray;
      });
    }

    // Disable future dates for logging purposes
    function disableFutureDates(time) {
      return time.getTime() > Date.now();
    }

    // Load list of habits from database
    async function loadHabitList() {
      const tmpHabitList = await habitListener.loadHabits(userId);
      habitsList.value = habitsList.value.concat(tmpHabitList);
      habitsList.value = habitsList.value.filter((element) => {
        return element !== undefined;
      });
      habitsList.value = Array.from(
        new Set(habitsList.value.map((s) => s.id))
      ).map((id) => {
        return {
          id: id,
          title: habitsList.value.find((s) => s.id === id).title,
        };
      });
    }

    // Creating a new habit and adding it to the list of habits
    function addHabit() {
      const habitToCreate = {
        id: uuid.v4(),
        title: habitTitle.value,
      };
      habitsList.value.push(habitToCreate);
      habitTitle.value = "";
    }

    async function habitLogged() {
      const checkedArray = [];
      logForTheWeek.value.forEach((entry) => {
        const tmpLoggedEntry = entry.id + "_" + entry.timestamp;
        checkedArray.push(tmpLoggedEntry);
      });
      checkedBoxes.value = checkedArray.slice();
      savedHabits.value = checkedArray.slice();
    }

    async function saveHabits() {
      const tmpLoggedHabits = [];

      checkedBoxes.value.forEach((element) => {
        if (!savedHabits.value.includes(element)) {
          const tmpHabitSplit = element.split("_");
          const tmpObject = {
            id: tmpHabitSplit[0],
            timestamp: parseInt(tmpHabitSplit[1]),
          };
          habitsList.value.forEach((habit_element) => {
            if (habit_element.id === tmpObject.id) {
              tmpObject.title = habit_element.title;
            }
          });
          tmpLoggedHabits.push(tmpObject);
        }
      });

      const habitsToDelete = [];
      const removedHabits = savedHabits.value.filter(
        (x) => !checkedBoxes.value.includes(x)
      );
      console.log(removedHabits);
      if (removedHabits.length > 0) {
        logForTheWeek.value.forEach((entry) => {
          const entryString = entry.id + "_" + entry.timestamp;
          console.log(entry);
          if (removedHabits.includes(entryString)) {
            habitsToDelete.push(entry.doc_id);
          }
        });
      }

      await habitListener.saveHabits(userId, tmpLoggedHabits, habitsToDelete);
      loadHabitList();
      getLogs();
    }

    async function getLogs() {
      const tmpLogsList = await habitListener.getHabitLog().then((result) => {
        return result;
      });
      const assignToList = async () => {
        const tempArray = await tmpLogsList;
        logForTheWeek.value = tempArray.slice();
        habitLogged();
      };
      assignToList();
    }

    
    onMounted(async () => {
      getStartOfWeek();
      generateWeekDates(startDate.value);
      buildHeadersForTable(timestampWeekDates.value, weekDates.value);
      loadHabitList();
      getLogs();
    });

    return {
      tableData,
      weekDates,
      disableFutureDates,
      startDate,
      updateTableDates,
      habitTitle,
      habitData,
      addHabit,
      timestampWeekDates,
      tmpHabitLogs,
      tableHeader,
      currentTimestamp,
      tmpHabit,
      habitListener,
      logForTheWeek,
      habitsList,
      loadHabitList,
      habitLogged,
      checkedHabit,
      saveHabits,
      checkedBoxes,
    };
  },
};
</script>

<style scoped>
table {
  height: 400px;
}
th {
  padding-right: 50px;
}

.title {
  padding-right: 150px;
}

.title_class {
  text-align: left;
}
</style>
