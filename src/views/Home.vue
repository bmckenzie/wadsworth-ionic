<template>
  <div class="home">
    <h1>Wadsworth</h1>
  </div>
  <div>
    <form @submit.prevent="login">
      <h2>Log In</h2>
      <el-input
        type="email"
        placeholder="Email address..."
        v-model="email"
      ></el-input>
      <el-input
        type="password"
        placeholder="Password"
        v-model="password"
      ></el-input>
      <el-button @click="login">Log In</el-button>
      <el-button @click="logout">Log Out</el-button>
    </form>
  </div>
</template>

<script>
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

export default {
  name: "Home",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    login() {
      const auth = getAuth();
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          signInWithEmailAndPassword(auth, this.email, this.password).then(
            (userCredential) => {
              if (this.$store.isAuthenthicated === null) {
                this.$store.commit("LOGIN");
              }
              const user = userCredential.user;
              this.$store.dispatch("setUserId", { userId: user.uid });
              this.$router.push("/dashboard");
            }
          );
        })
        .catch((error) => console.log(error));
    },
    logout() {
      console.log("logout called");
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
input {
  margin-right: 20px;
}
</style>
