import { ref, onUnmounted, computed } from "vue";
import { useStore } from "vuex";

export const useUser = () => {
  const store = useStore();
  const user = computed(() => store.state.user);
  return user;
};
export const useIsSignedIn = () => {
  const store = useStore();
  const isSignedIn = computed(() => store.getters.isSignedIn);
  return isSignedIn;
};

export const sleep = async (seconds: number) => {
  return await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const useTimerBase = (
  getCurrentTime: () => number,
  sleepTime?: number
) => {
  let loop = true;

  const now = ref(getCurrentTime());

  onUnmounted(() => {
    loop = false;
  });
  (async () => {
    while (loop) {
      now.value = getCurrentTime();
      await sleep(sleepTime || 0.1);
    }
  })();

  return now;
};

export const currentTime = () => {
  return Math.floor(new Date().getTime() / 1000);
};
