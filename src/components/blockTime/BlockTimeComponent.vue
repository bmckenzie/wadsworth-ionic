<template>
  <h2>Block Time</h2>
  <FullCalendar ref="fc" :options="calendarOptions" />
  <el-row>
    <el-col :span="24">
      <el-checkbox v-model="sunChecked">Sunday</el-checkbox>
      <el-checkbox v-model="monChecked">Monday</el-checkbox>
      <el-checkbox v-model="tueChecked">Tuesday</el-checkbox>
      <el-checkbox v-model="wedChecked">Wednesday</el-checkbox>
      <el-checkbox v-model="thuChecked">Thursday</el-checkbox>
      <el-checkbox v-model="friChecked">Friday</el-checkbox>
      <el-checkbox v-model="satChecked">Saturday</el-checkbox>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <el-input
        placeholder="Block Time Title"
        v-model="blockTimeTitle"
      ></el-input>
      <el-input
        type="textarea"
        v-model="blockTimeDescription"
        rows="5"
        placeholder="Block Time Description"
      ></el-input>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="6">
      <el-time-select
        placeholder="Start Time"
        v-model="startTime"
        start="00:00"
        step="00:15"
        end="23:45"
      >
      </el-time-select>
    </el-col>
    <el-col :span="6">
      <el-time-select
        placeholder="End Time"
        v-model="endTime"
        start="00:00"
        step="00:15"
        end="23:45"
        :minTime="startTime"
      >
      </el-time-select>
    </el-col>
    <el-col :span="6"> Tagged Items: </el-col>
    <el-col :span="6">
      <el-input placeholder="Tags..." v-model="tagSearch"></el-input>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <el-tag v-for="(tag, index) in tags" :key="index" closable>
        {{ tag.name }}
      </el-tag>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="12">
      <el-button @click="addBlockTime">Add Block Time</el-button>
    </el-col>
    <el-col :span="12">
      <el-button @click="saveBlockTimeSchedules">Save Block Times</el-button>
    </el-col>
  </el-row>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { saveBlockTimes, loadBlockTimes } from "@/firebaseConfig.js";
import FullCalendar from "@fullcalendar/vue3";
import timeGridPlugin from "@fullcalendar/timegrid";
import rrulePlugin from "@fullcalendar/rrule";
import interactionPlugin from "@fullcalendar/interaction";

export default {
  components: {
    FullCalendar,
  },
  setup() {
    const blockTimeTitle = ref("");
    const blockTimeDescription = ref("");
    const calendarOptions = ref({
      plugins: [timeGridPlugin, rrulePlugin, interactionPlugin],
      initialView: "timeGridWeek",
      events: [],
      allDaySlot: false,
      editable: true,
    });

    const sunChecked = ref(false);
    const monChecked = ref(false);
    const tueChecked = ref(false);
    const wedChecked = ref(false);
    const thuChecked = ref(false);
    const friChecked = ref(false);
    const satChecked = ref(false);
    const events = ref([]);
    const startTime = ref("");
    const endTime = ref("");
    const tags = ref([]);
    const tagSearch = ref("");
    const calendarStartDate = ref("");
    const store = useStore();
    const userId = store.getters.getUserId;

    // Block Time Listener
    const blockTimeListener = {
      saveBlockTimeSchedules: function (blockTimeArray) {
        return saveBlockTimes(userId, blockTimeArray);
      },
      loadBlockTimeSchedules: function () {
        return loadBlockTimes(userId);
      },
    };

    function addBlockTime() {
      const tmpEventObject = {};
      tmpEventObject.title = blockTimeTitle.value;
      tmpEventObject.extendedProps = {
        description: blockTimeDescription.value,
      };
      tmpEventObject.daysOfWeek = [];
      if (sunChecked.value) {
        tmpEventObject.daysOfWeek.push(0);
      }
      if (monChecked.value) {
        tmpEventObject.daysOfWeek.push(1);
      }
      if (tueChecked.value) {
        tmpEventObject.daysOfWeek.push(2);
      }
      if (wedChecked.value) {
        tmpEventObject.daysOfWeek.push(3);
      }
      if (thuChecked.value) {
        tmpEventObject.daysOfWeek.push(4);
      }
      if (friChecked.value) {
        tmpEventObject.daysOfWeek.push(5);
      }
      if (satChecked.value) {
        tmpEventObject.daysOfWeek.push(6);
      }
      tmpEventObject.startTime = startTime.value;
      tmpEventObject.endTime = endTime.value;
      console.log(calendarOptions.value.events);
      calendarOptions.value.events.push(tmpEventObject);

      blockTimeTitle.value = "";
      blockTimeDescription.value = "";
      sunChecked.value = false;
      monChecked.value = false;
      tueChecked.value = false;
      wedChecked.value = false;
      thuChecked.value = false;
      friChecked.value = false;
      satChecked.value = false;
      startTime.value = "";
      endTime.value = "";
    }

    function saveBlockTimeSchedules() {
      blockTimeListener.saveBlockTimeSchedules(calendarOptions.value.events);
    }

    async function loadBlockTimeSchedule() {
      const tmpBlockTimeList = await blockTimeListener.loadBlockTimeSchedules();
      const assignToList = async () => {
        const tmpArray = await tmpBlockTimeList;
        calendarOptions.value.events = tmpArray;
      };
      assignToList();
    }

    async function saveBlockTimeSchedule() {
      const tmpBlockTimeList = await blockTimeListener.saveBlockTimeSchedules(
        calendarOptions.value.events
      );
      const assignToList = async () => {
        const tmpArray = await tmpBlockTimeList;
        calendarOptions.value.events = tmpArray;
      };
      assignToList();
    }

    onMounted(() => {
      loadBlockTimeSchedule();
    });

    onUnmounted(() => {
      saveBlockTimeSchedule();
    });

    return {
      calendarOptions,
      blockTimeTitle,
      blockTimeDescription,
      sunChecked,
      monChecked,
      tueChecked,
      wedChecked,
      thuChecked,
      friChecked,
      satChecked,
      events,
      startTime,
      endTime,
      tags,
      tagSearch,
      addBlockTime,
      calendarStartDate,
      saveBlockTimeSchedules,
    
    };
  },
};
</script>

<style scoped>
.calendar-wrapper {
  height: 800px;
}

.calendar-parent {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: hidden;
  max-height: 80vh;
  background-color: white;
}
</style>
