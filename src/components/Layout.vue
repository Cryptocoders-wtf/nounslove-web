<template>
  <div class="layout">
    <div v-if="!hasMetaMask">
      <h1>{{ $t("installMetaMask") }}</h1>
    </div>
    <div v-else-if="!isValidChain">
      <h1>{{ $t("invalidNetwork") }}</h1>
      {{ $t("youNeetNet", { networdName }) }}
      <div class="text-left ml-6">
        <Languages />
      </div>
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
import { defineComponent, ref, reactive, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { ethers } from "ethers";

import { useI18nParam } from "@/i18n/utils";

import Languages from "@/components/Languages.vue";

import nounsTokenJson from "@/abi/NounsToken";

import { ethereumConfig } from "@/config/project";

export default defineComponent({
  name: "AppLayout",
  components: {
    Languages,
  },
  async setup() {
    const store = useStore();

    useI18nParam();

    const chainId = ref("");
    const accounts = ref<string[]>([]);

    const ethereum = window.ethereum;
    const hasMetaMask = !!ethereum;
    if (!hasMetaMask) {
      return { hasMetaMask: false };
    }

    const { contractAddress, networdName } = ethereumConfig;

    const switchNetwork = async (chainId: string) => {
      console.log(chainId);
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
      } catch (e) {
        console.log(e);
      }
    };

    ethereum.on("accountsChanged", (_accounts: any) => {
      console.log("accountsChanged");
      accounts.value = _accounts;
    });
    ethereum.on("chainChanged", (_chainId: string) => {
      console.log("change");
      chainId.value = _chainId;
    });
    ethereum.on("connect", (info: any) => {
      console.log("connect");
      chainId.value = info.chainId;
    });
    ethereum.on("disconnect", (info: any) => {
      chainId.value = "";
    });
    const initChainId = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      chainId.value = ethers.utils.hexlify(network.chainId);
    };
    onMounted(() => {
      initChainId();
      switchNetwork(ethereumConfig.chainId);
    });
    const isValidChain = computed(() => {
      console.log(chainId.value, ethereumConfig.chainId);
      return parseInt(chainId.value) === parseInt(ethereumConfig.chainId);
    });

    const provider = computed(() => {
      if (isValidChain.value) {
        return new ethers.providers.Web3Provider(window.ethereum);
      }
      return null;
    });
    watch(provider, (v) => {
      if (v) {
        v.listAccounts().then((res) => {
          accounts.value = res;
        });
      }
    });
    const contract = computed(() => {
      if (provider.value) {
        return new ethers.Contract(
          contractAddress,
          nounsTokenJson.abi,
          provider.value
        );
      }
      return null;
    });
    return {
      hasMetaMask,
      networdName,
      isValidChain,
      provider,
      contract,
      accounts,
    };
  },
});
</script>
