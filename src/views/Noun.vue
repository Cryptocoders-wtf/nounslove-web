<template>
  <div class="home">
    <div class="justify-center items-center font-pt-root">
      <div class="ml-0">
        <div class="sm:flex">
          <div class="sm:w-1/2 w-full" :class="bgColor">
            <a
              :href="`${openseaUrl}/assets/${contractAddress}/${nounId}`"
              target="_blank"
            >
              <img :src="nfts[nounId]?.data?.image" class="w-full" />
            </a>
          </div>
          <div
            class="flex flex-1 flex-col sm:w-1/2 w-full pb-4 px-4 pt-6"
            :class="bgColor"
          >
            <div class="text-left font-londrina text-4xl">
              <router-link :to="`${prevNounId}`" v-if="prevNounId"
                >&lt;</router-link
              >
              {{ nfts[nounId]?.data?.name || "Loading..." }}
              <router-link :to="`${nextNounId}`" v-if="nextNounId"
                >&gt;</router-link
              >
              <br />
            </div>
            <div class="text-left font-bold">
              {{ nfts[nounId]?.data?.description || "Loading..." }}
            </div>
            <div class="text-left">
              {{ $t("heldBy") }}
              <span>
                {{ (nfts[nounId]?.owner || "").substr(0, 10) || "Loading..."
                }}<br />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="font-londrina text-4xl mt-6">
      <h1>{{ $t("aboutNounsLove") }}</h1>
    </div>
    <div class="text-left ml-6">
      <Languages />
    </div>
    <Message />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, reactive, watch, computed, PropType } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ethers } from "ethers";

import { ethereumConfig } from "@/config/project";

import Languages from "@/components/Languages.vue";
import Message from "@/components/Message.vue";

import { NFT, NFTData } from "./types";

import { useNFTs } from "./HomeUtils";

export default defineComponent({
  components: {
    Message,
    Languages,
  },
  props: {
    contract: {
      type: ethers.Contract,
      required: true,
    },
    provider: {
      type: [ethers.providers.Web3Provider, ethers.providers.AlchemyProvider],
      required: true,
    },
    accounts: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
  },
  setup(props) {
    const router = useRoute();
    const store = useStore();

    const { nfts, updateNFT, updateNftData, updateOwnerData } = useNFTs(
      props.contract
    );

    const { contractAddress, openseaUrl } = ethereumConfig;
    const nextToken = ref(0);
    const nounId = computed(() => {
      return router.params.nounId;
    });
    const nextNounId = computed(() => {
      const id = Number(nounId.value) + 1;
      if (id < nextToken.value) {
        return String(id);
      }
      return null;
    });
    const prevNounId = computed(() => {
      const id = Number(nounId.value) - 1;
      if (id > -1) {
        return String(id);
      }
      return null;
    });

    const bgColor = computed(() => {
      const nft = nfts.value[String(nounId.value)];
      if (nft) {
        return nft.bgColor;
      }
      return "bg-nouns-gray";
    });
    watch(bgColor, () => {
      store.commit("setBgColor", bgColor.value);
    });
    watch(nounId, () => {
      updateNftData(String(nounId.value));
      updateOwnerData(String(nounId.value));
    });
    const initEvent = () => {
      props.contract.functions.getCurrentToken().then((res) => {
        nextToken.value = res[0].toString();
      });
      updateNftData(String(nounId.value));
      updateOwnerData(String(nounId.value));
    };
    initEvent();
    return {
      contractAddress,
      openseaUrl,

      nextNounId,
      prevNounId,

      nfts,
      nounId,
      bgColor,
    };
  },
});
</script>
