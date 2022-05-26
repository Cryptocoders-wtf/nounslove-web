<template>
  <Particles
    id="tsparticles"
    :particlesInit="particlesInit"
    :particlesLoaded="particlesLoaded"
    :options="options"
  />
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, computed } from "vue";
import { loadFireworksPreset } from "tsparticles-preset-fireworks";
import { loadFountainPreset } from "tsparticles-preset-fountain";

import { loadSeaAnemonePreset } from "tsparticles-preset-sea-anemone";
// import { loadConfettiPreset } from "tsparticles-preset-confetti";

export default defineComponent({
  setup() {
    const presets = ["fireworks", "fountain", "seaAnemone"];
    // "confetti";
    const seed = Math.floor(Math.random() * presets.length);

    return {
      particlesLoaded: () => {
        console.log(presets[seed]);
      },
      particlesInit: async (engine: any) => {
        await loadFireworksPreset(engine);
        await loadFountainPreset(engine);
        await loadSeaAnemonePreset(engine);
        // await loadConfettiPreset(engine);
      },
      options: {
        preset: presets[seed],
      },
    };
  },
});
</script>
