<template>
  <div class="register">
    <form @submit.prevent="register">
      <h2>About</h2>
      <!-- <h2>Register</h2> -->
      <!-- <input type="email" placeholder="Email address..." v-model="email" />
      <br />
      <input type="password" placeholder="Password" v-model="password" />
      <br />
      <input
        type="password"
        placeholder="Verify Password"
        v-model="verifyPassword"
      /> -->
      <p>
        Wadsworth is a "life management" app: time management for people that
        don't know much about time management. Its goal is to provide features
        and functionality that will help people make better decisions, live
        better lives, and accomplish long-term goals.
      </p>
      <p>
        At this time, Wadsworth is currently in development and new accounts
        cannot be created. If you would like to keep up do date with us, you can
        follow our blog at the following link: http://link.to.blog/goes/here.
      </p>
      <p>We hope to see you again once we're up and running! And remember:</p>
      <p>Wadsworth. Less forgetting, more living.</p>
      <br />
      <!-- <button type="submit">Register!</button
      > -->
    </form>
  </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { createNewUser } from "../firebaseConfig";

export default {
  data() {
    return {
      email: "",
      password: "",
      verifyPassword: "",
    };
  },
  methods: {
    async register() {
      if (this.password !== this.verifyPassword) {
        alert("Passwords must match!");
        return;
      }

      if (this.email === "") {
        alert("Enter an email!");
        return;
      }

      const auth = getAuth();
      createUserWithEmailAndPassword(auth, this.email, this.password)
        .then(() => {
          alert("Successfully registered! Please login.");
        })
        .then(() => {
          const cred = auth.currentUser;
          createNewUser(cred.uid);
        })
        .then(() => {
          this.$router.push("/");
        })
        .catch((error) => {
          alert(error.message);
        });
    },
  },
};
</script>
