<template>
  <div class="layout">
    <div v-if="!hasMetaMask">
      <h1>{{ $t("installMetaMask") }}</h1>
    </div>
    <div v-else-if="!isValidChain">
      <h1>Invalid Netword</h1>
    </div>
    <template v-else>
      <template v-if="contract && provider">
        <router-view
          :contract="contract"
          :provider="provider"
          :accounts="accounts"
          />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, watch } from "vue";
import { useStore } from "vuex";
import { ethers } from "ethers";

import { useI18nParam } from "@/i18n/utils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nounsTokenJson = require("../views/NounsTokenLocal.json");

import { ethereumConfig } from "../config/project";

export default defineComponent({
  name: "AppLayout",
  components: {},
  async setup() {
    const store = useStore();

    useI18nParam();
 
    const chainId = ref("");
    const accounts = ref<string[]>([]);

    const ethereum = window.ethereum;
    const hasMetaMask = !!ethereum
    if (!hasMetaMask) {
      return { hasMetaMask: false };
    }
    
    const { contractAddress } = ethereumConfig;

    const switchNetwork = async (chainId: string) => {
      try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
      } catch(e) {
        console.log(e);
      }
    };
    
    ethereum.on("accountsChanged", (_accounts: any) => {
      accounts.value = _accounts;
    });
    ethereum.on("chainChanged", (_chainId: string) => {
      chainId.value = _chainId;
    });
    ethereum.on("connect", (info: any) => {
      chainId.value = info.chainId;
    });
    ethereum.on("disconnect", (info: any) => {
      chainId.value = "";
    });

    switchNetwork(ethereumConfig.chainId)

    const isValidChain = computed(() => {
      return chainId.value === ethereumConfig.chainId;
    });
    
    const provider = computed(() => {
      if (isValidChain.value) {
        return new ethers.providers.Web3Provider(window.ethereum);
      }
      return null;
    });
    watch((provider), (v) => {
      if (v) {
        v.listAccounts().then(res => {
          accounts.value = res;
        });
      }
    });
    const contract = computed(() => {
      if (provider.value) {
        return new ethers.Contract(
          contractAddress,
          nounsTokenJson.abi,
          provider.value,
        );
      }
      return null;
    });
    return {
      hasMetaMask,
      isValidChain,
      provider,
      contract,
      accounts,
    };
  },
});
</script>
