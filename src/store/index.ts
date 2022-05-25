import { createStore } from "vuex";
import { User } from "firebase/auth";

interface State {
  user: User | null | undefined;
  bgColor: string;
}

export default createStore<State>({
  state: {
    user: undefined,
    bgColor: "bg-white",
  },
  mutations: {
    setUser(state: State, user: User | null) {
      state.user = user;
    },
    setBgColor(state: State, color: string) {
      state.bgColor = color;
    },
  },
  getters: {
    isSignedIn: (state: State) => {
      return state.user !== null && state.user !== undefined;
    },
  },
  actions: {},
  modules: {},
});
