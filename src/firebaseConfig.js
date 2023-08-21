import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import {
  doc,
  setDoc,
  getFirestore,
  onSnapshot,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  getDocs,
  orderBy,
  where,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import store from "./store";
import { isEqual } from "lodash";
// import habits from "./store/modules/habits";


import {firebaseConfig} from "./firebase-secret.js"

initializeApp(firebaseConfig);

// User auth and persistance
const auth = getAuth();

auth.onAuthStateChanged((user) => {
  store.dispatch("setUserId", { userId: user.uid });
});

// DB setup and usage

const db = getFirestore();

// Goal Creation, Search, Retrieval, and Deletion

function createNewGoal(userId, newGoalObject) {
  try {
    addDoc(collection(db, "users", userId, "goals"), newGoalObject);
  } catch (error) {
    return error;
  }
}

async function findAllGoals(userId) {
  try {
    const goalsRef = collection(db, "users", userId, "goals");
    const q = onSnapshot(goalsRef);
    const querySnapshot = await getDocs(q);

    console.log(querySnapshot);

    let tempArray = [];
    querySnapshot.forEach((doc) => {
      tempArray.push({ id: doc.id, data: doc.data() });
    });

    return tempArray;
  } catch (error) {
    return error;
  }
}

async function deleteGoalFromDB(userId, docId) {
  console.log(
    "UID: " +
      userId +
      " docID: " +
      docId +
      "\n" +
      "TODO: delete the goal. Possibly remove goal from project using a Cloud Function."
  );
  return;
}

// This returns *just* a list and title of the goals, none of the sections.
async function getListOfGoals(userId) {
  try {
    const goalsRef = collection(db, "users", userId, "goals");
    const tempArray = [];
    onSnapshot(goalsRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        tempArray.push({ id: doc.id, title: doc.data().title });
      });
    });
    return tempArray;
  } catch (error) {
    return error;
  }
}

// Query to get a goal.
async function getGoal(userId, docId) {
  try {
    const q = doc(db, "users", userId, "goals", docId);
    const docSnap = await getDoc(q);

    return docSnap.data();
  } catch (error) {
    return error;
  }
}

async function getOrderOfGoals(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const q = query(docRef);
    const docSnap = await getDoc(q);
    return docSnap.data();
  } catch (error) {
    return error;
  }
}

// This returns *just* a list and title of the goals, none of the sections
async function returnOrderedGoals(userId, arrayOfGoals) {
  try {
    const tempArray = [];
    arrayOfGoals.forEach(async (currentValue) => {
      const docSnap = await getDoc(
        query(doc(db, "users", userId, "goals", currentValue.id))
      );
      tempArray.push({ id: docSnap.id, title: docSnap.data().title });
    });
    return tempArray;
  } catch (error) {
    return error;
  }
}

async function saveGoalOrder(userId, orderOfGoals) {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, { goalOrder: orderOfGoals });
    return;
  } catch (error) {
    return error;
  }
}

async function saveGoal(userId, docId, updatedGoalObject) {
  try {
    const docRef = doc(db, "users", userId, "goals", docId);
    await updateDoc(docRef, updatedGoalObject);
    return;
  } catch (error) {
    return error;
  }
}

async function loadSection(userId, docId) {
  try {
    const docRef = doc(db, "users", userId, "goals", docId);
    const docSnap = await getDoc(docRef, "section");
    return docSnap.data();
  } catch (error) {
    return error;
  }
}

async function getProjectsLinkedToGoal(userId, goalId) {
  const docRef = collection(db, "users", userId, "projects");
  const q = query(
    docRef,
    where("connectedGoal", "==", goalId),
    orderBy("timeCreated")
  );
  const querySnapshot = await getDocs(q);
  const tempArray = [];
  querySnapshot.forEach((doc) => {
    tempArray.push({
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description,
      deadline: doc.data().deadline,
      tags: doc.data().tags,
      connectedChecklists: doc.data().connectedChecklists,
      connectedGoal: doc.data().connectedGoal,
      connectedTasks: doc.data().connectedTasks,
      timeCreated: doc.data().timeCreated,
    });
  });
  return tempArray;
}

// Project Creation, Search, Retrieval, and Deletion

async function createNewProject(userId, projectObject) {
  /* Project object:
      title: "",
      description: "",
      deadline: null,
      tags: [],
      connectedCheckists: [],
      connectedGoal: "",
      connectedTasks: []
  */
  try {
    const docRef = collection(db, "users", userId, "projects");
    await addDoc(docRef, projectObject);
  } catch (error) {
    return error;
  }
}

async function getProjectList(userId) {
  try {
    const projectsRef = collection(db, "users", userId, "projects");
    const tempArray = [];
    onSnapshot(projectsRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (
          !tempArray.find((v) => {
            isEqual(v, doc);
          })
        ) {
          tempArray.unshift({
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description,
            deadline: doc.data().deadline,
            tags: doc.data().tags,
            connectedChecklists: doc.data().connectedChecklists,
            connectedGoal: doc.data().connectedGoal,
            connectedTasks: doc.data().connectedTasks,
            timeCreated: doc.data().timeCreated,
          });
        }
      });
    });

    const orderedArray = [];
    const q = query(projectsRef, orderBy("timeCreated"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      orderedArray.push({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        deadline: doc.data().deadline,
        tags: doc.data().tags,
        connectedChecklists: doc.data().connectedChecklists,
        connectedGoal: doc.data().connectedGoal,
        connectedTasks: doc.data().connectedTasks,
        timeCreated: doc.data().timeCreated,
      });
    });

    return orderedArray;
  } catch (error) {
    return error;
  }
}

async function updateCurrentProject(userId, docId, updatedProjectObject) {
  const docRef = doc(db, "users", userId, "projects", docId);
  if (updatedProjectObject.deadline === "Invalid Date") {
    updatedProjectObject.deadline = "";
  }
  await updateDoc(docRef, updatedProjectObject).catch((error) => {
    return error;
  });
}

async function getAllProjectTags(userId) {
  const projectsRef = collection(db, "users", userId, "projects");
  const arrayOfTags = [];
  const finalArray = [];
  onSnapshot(projectsRef, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.data().tags.length > 0) {
        doc.data().tags.forEach((entry) => {
          if (!arrayOfTags.includes(entry)) {
            arrayOfTags.push(entry);
            finalArray.push({ text: entry, value: entry });
          }
        });
      }
    });
  });
  return finalArray;
}

async function getProject(userId, docId) {
  const docRef = doc(db, "users", userId, "projects", docId);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}

async function getAllProjectsList(userId) {
  const projectsRef = collection(db, "users", userId, "projects");
  const tempArray = [];
  onSnapshot(projectsRef, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (
        !tempArray.find((v) => {
          isEqual(v, doc);
        })
      ) {
        tempArray.unshift({
          id: doc.id,
          title: doc.data().title,
          timeCreated: doc.data().timeCreated,
        });
      }
    });
  });

  const orderedArray = [];
  const q = query(projectsRef, orderBy("timeCreated"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    orderedArray.push({
      id: doc.id,
      title: doc.data().title,
    });
  });

  return orderedArray;
}

async function fetchProjectTasks(userId, docId) {
  const tasksRef = collection(db, "users", userId, "tasks");
  const q = query(
    tasksRef,
    where("connectedProject", "==", docId),
    orderBy("timeCreated")
  );
  const querySnapshot = await getDocs(q);
  const tempArray = [];
  querySnapshot.forEach((doc) => {
    if (!doc.data().completed) {
      tempArray.push({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        completed: doc.data().completed,
        tags: doc.data().tags,
        connectedProject: doc.data().connectedProject,
        timeCreated: doc.data().timeCreated,
      });
    }
  });
  return tempArray;
}

// Task functions
/*  title: taskTitle.value,
          description: taskDescription.value,
          completed: false,
          tags: taskTags.value,
          connectedProject: taskProject.value,
          timeCreated: timestamp
*/

async function addTask(userId, taskObject) {
  const docRef = collection(db, "users", userId, "tasks");
  await addDoc(docRef, taskObject);
}

async function getTasksList(userId) {
  const tasksRef = collection(db, "users", userId, "tasks");
  const tempArray = [];
  onSnapshot(tasksRef, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (
        !tempArray.find((v) => {
          isEqual(v, doc);
        })
      ) {
        tempArray.unshift({
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          tags: doc.data().tags,
          completed: doc.data().completed,
          connectedProject: doc.data().connectedProject,
          timeCreated: doc.data().timeCreated,
        });
      }
    });
  });

  const orderedArray = [];
  const q = query(tasksRef, orderBy("timeCreated"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    orderedArray.push({
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description,
      tags: doc.data().tags,
      completed: doc.data().completed,
      connectedProject: doc.data().connectedProject,
      timeCreated: doc.data().timeCreated,
    });
  });

  return orderedArray;
}

async function updateCurrentTask(userId, taskId, taskObject) {
  console.log(taskObject);
  const docRef = doc(db, "users", userId, "tasks", taskId);
  await updateDoc(docRef, taskObject).catch((error) => {
    return error;
  });
}

// User functions
async function createNewUser(userId) {
  const docRef = doc(db, "users", userId);
  setDoc(collection(db, "users", userId, "goals"), {});
  await updateDoc(docRef, { goalOrder: [] });
}

async function completeTheTask(userId, taskId) {
  const docRef = doc(db, "users", userId, "tasks", taskId);
  await updateDoc(docRef, { completed: true });
}

async function makeTaskActive(userId, taskId) {
  const docRef = doc(db, "users", userId, "tasks", taskId);
  await updateDoc(docRef, { completed: false });
}

async function fetchAllTaskTags(userId) {
  const tasksRef = collection(db, "users", userId, "tasks");
  const arrayOfTags = [];
  const finalArray = [];
  onSnapshot(tasksRef, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.data().tags.length > 0) {
        doc.data().tags.forEach((entry) => {
          if (!arrayOfTags.includes(entry)) {
            arrayOfTags.push(entry);
            finalArray.push({ text: entry, value: entry });
          }
        });
      }
    });
  });
  return finalArray;
}

// Block Time Schedule Functions

async function saveBlockTimes(userId, blockTimeObject) {
  const blockTimeRef = doc(db, "users", userId);
  await updateDoc(blockTimeRef, { blockTimeSchedule: blockTimeObject });
}

async function loadBlockTimes(userId) {
  const blockTimeRef = doc(db, "users", userId);
  const q = query(blockTimeRef);
  const docSnap = await getDoc(q);
  return docSnap.data().blockTimeSchedule;
}

// Habit Functions

async function saveHabitsDB(userId, habitsObjects, docsToDelete) {
  const habitsRef = collection(db, "users", userId, "habits");
  habitsObjects.forEach(async (element) => {
    await addDoc(habitsRef, element);
  });

  const habitsListRef = doc(db, "users", userId);
  const tmpHabitListCheck = await getDoc(habitsListRef);
  if (!tmpHabitListCheck.data().habitList) {
    console.log("I'm here!");
    const result = Array.from(new Set(habitsObjects.map((s) => s.id))).map(
      (id) => {
        return {
          id: id,
          title: habitsObjects.find((s) => s.id === id).title,
        };
      }
    );
    await updateDoc(habitsListRef, { habitList: result });
  }
  // Refresh the doc that's been updated
  const finalDoc = await getDoc(habitsListRef);
  const distinctIds = [...new Set(habitsObjects.map((habit) => habit.id))];
  const distinctHabitList = [
    ...new Set(finalDoc.data().habitList.map((habit) => habit.id)),
  ];

  const differenceBetweenArrays = [];
  distinctHabitList.forEach((element) => {
    if (!distinctIds.includes(element)) {
      differenceBetweenArrays.push(element);
    }
  });

  if (docsToDelete.length > 0) {
    docsToDelete.forEach(async (document) => {
      const docToDelete = doc(db, "users", userId, "habits", document);
      await deleteDoc(docToDelete);
    });
  }

  habitsObjects.forEach((element) => {
    if (differenceBetweenArrays.includes(element.id)) {
      updateDoc(
        habitsListRef,
        arrayUnion({ id: element.id, title: element.title })
      );
    }
  });
}

async function loadHabitsListDB(userId) {
  const habitsRef = doc(db, "users", userId);
  const q = query(habitsRef);
  const docSnap = await getDoc(q);
  return docSnap.data().habitList;
}

async function loadHabitsLogDB(userId, timestamps) {
  // const goalsRef = collection(db, "users", userId, "goals");
  // const q = onSnapshot(goalsRef);
  // const querySnapshot = await getDocs(q);

  // console.log(querySnapshot);

  // let tempArray = [];
  // querySnapshot.forEach((doc) => {
  //   tempArray.push({ id: doc.id, data: doc.data() });
  // });
  const habitsRef = collection(db, "users", userId, "habits");
  const q = query(
    habitsRef,
    where("timestamp", ">=", timestamps[0]),
    where("timestamp", "<=", timestamps[6])
  );
  const tmpArray = [];
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    tmpArray.push({
      doc_id: doc.id,
      id: doc.data().id,
      title: doc.data().title,
      timestamp: doc.data().timestamp,
    });
  });
  return tmpArray;
}

export {
  createNewUser,
  createNewGoal,
  createNewProject,
  findAllGoals,
  deleteGoalFromDB,
  getListOfGoals,
  getGoal,
  saveGoalOrder,
  returnOrderedGoals,
  getOrderOfGoals,
  saveGoal,
  loadSection,
  updateCurrentProject,
  getProjectList,
  getAllProjectTags,
  getProjectsLinkedToGoal,
  getProject,
  addTask,
  getTasksList,
  updateCurrentTask,
  completeTheTask,
  fetchAllTaskTags,
  getAllProjectsList,
  fetchProjectTasks,
  makeTaskActive,
  saveBlockTimes,
  loadBlockTimes,
  saveHabitsDB,
  loadHabitsListDB,
  loadHabitsLogDB,
};
export default firebaseConfig;
