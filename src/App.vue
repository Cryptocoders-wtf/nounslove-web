<template>
  <div id="nav">
  </div>
  <div class="font-londrina" :class="bgColor">
    <h1 class="text-4xl">Nouns Love💖</h1>
  </div>
  <Suspense>
    <router-view />
  </Suspense>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useUser, useIsSignedIn } from "@/utils/utils";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();

    const user = useUser();
    const isSignedIn = useIsSignedIn();

    const bgColor = computed(() => store.state.bgColor);

    return {
      user,
      isSignedIn,

      bgColor,
    };
  },
});
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Londrina+Solid&display=swap');
@import url('https://fonts.cdnfonts.com/css/pt-root-ui');
@import url('https://fonts.googleapis.com/css2?family=Yusei+Magic&display=swap');

#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50; */
  @apply font-sans antialiased text-center text-gray-700;
}

#nav {
  /* padding: 30px; */
  /* @apply p-8; */
}

#nav a {
  /* font-weight: bold;
  color: #2c3e50; */
  @apply font-bold text-gray-700;
}

#nav a.router-link-exact-active {
  /* color: #42b983; */
  @apply text-green-600;
}

a {
  @apply cursor-pointer;
}
</style>
