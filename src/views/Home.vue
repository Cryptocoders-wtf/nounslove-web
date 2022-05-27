<template>
  <div class="home">
    <div class="justify-center items-center font-pt-root">
      <div class="w-full h-full">
        <Animation v-show="fireOn" />
      </div>
      <div class="ml-0">
        <!-- on sale noun -->
        <div v-if="currentToken == 0">
          <button
            @click="mintNouns"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {{ $t("getNoun") }}
          </button>
        </div>
        <div v-if="nfts[currentToken] && !fireOn" class="sm:flex">
          <div class="sm:w-1/2 w-full" :class="bgColor">
            <a
              :href="`https://testnets.opensea.io/assets/${contractAddress}/${currentToken}`"
              target="_blank"
            >
              <img :src="nfts[currentToken].data?.image" class="w-full" />
            </a>
          </div>
          <div
            class="flex flex-1 flex-col sm:w-1/2 w-full pb-4 px-4"
            :class="bgColor"
          >
            <span class="text-red-600 font-bold">
              {{ $t("acceptingBits") }}
            </span>

            <div class="text-left font-londrina text-4xl">
              {{ nfts[currentToken].data?.name }}<br />
            </div>
            <div class="text-left font-bold">
              {{ nfts[currentToken].data?.description }}
            </div>

            <div class="text-left font-bold mt-4">
              👉 {{ $t("currentPrice") }} {{ currentPrice }} Eth
            </div>
            <div v-if="buying[currentToken]">
              <span class="text-red-600 font-bold">
                You are buying....
                <div className="flex justify-center p-4">
                  <img
                    class="animate-spin h-4 w-8"
                    src="@/assets/red160px.png"
                  />
                </div>
              </span>
            </div>
            <div v-else-if="loading" :class="bgColor">Processing...</div>
            <div v-else>
              <button
                @click="mintNouns"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
              >
                {{ $t("getNoun") }}
              </button>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="w-full h-60" :class="bgColor">
            <div class="pt-6 font-londrina text-4xl">
              minting new one....
              <div className="flex justify-center">
                <div className="flex justify-center p-4">
                  <img
                    class="animate-spin h-4 w-8"
                    src="@/assets/red160px.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end of on sale -->
        <div class="font-londrina text-4xl mt-6">
          <h1>{{ $t("aboutNounsLove") }}</h1>
        </div>
        <div class="text-left ml-6">
          <Languages />
        </div>
        <Message />
        <div class="mt-4">
          <div v-for="(tokenId, key) in nftKeys" :key="key" class="mb-2">
            <template v-if="tokenId != currentToken">
              <div class="flex">
                <div class="flex-1">
                  <a
                    :href="`https://testnets.opensea.io/assets/${contractAddress}/${tokenId}`"
                    target="_blank"
                  >
                    <img
                      :src="nfts[tokenId].data?.image"
                      class="w-1/2 m-auto"
                    />
                  </a>
                </div>
                <div class="flex-1">
                  <div>
                    <span
                      v-if="accounts.includes(nfts[tokenId]?.owner)"
                      class="text-red-600 font-bold"
                    >
                      💖You wons!!
                    </span>
                  </div>
                  <div class="text-left font-londrina text-4xl">
                    {{ nfts[tokenId].data?.name }}<br />
                  </div>
                  <div class="text-left font-bold">
                    {{ nfts[tokenId].data?.description }}
                  </div>
                  <div class="text-left">
                    {{ $t("heldBy") }}
                    <span
                      v-if="accounts.includes(nfts[tokenId]?.owner)"
                      class="text-red-600 font-bold"
                    >
                      {{ (nfts[tokenId].owner || "").substr(0, 10) }}<br />
                    </span>
                    <span v-else>
                      {{ (nfts[tokenId].owner || "").substr(0, 10) }}<br />
                    </span>
                  </div>
                  <div class="text-left" v-if="tokenId % 10 !== 0">
                    💖 {{ $t("winningPrice") }} {{ nfts[tokenId].price }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- end of show -->
      <div @click="fire" class="text-white">nouns love!!</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";

import { ethers } from "ethers";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nounsTokenJson = require("../abi/NounsToken.json");

import { ethereumConfig } from "@/config/project";
import { sleep } from "@/utils/utils";
import {
  usePrice,
  useWatchTransaction,
  useFire,
  useCurrentAndNextToken,
} from "./HomeUtils";

import Animation from "./Animation.vue";
import Languages from "@/components/Languages.vue";
import Message from "@/components/Message.vue";

export default defineComponent({
  name: "HomePage",
  components: {
    Animation,
    Message,
    Languages,
  },
  props: {
    contract: {
      type: ethers.Contract,
      required: true,
    },
    provider: {
      type: ethers.providers.Web3Provider,
      required: true,
    },
    accounts: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const i18n = useI18n();
    const loading = ref(false);

    const nfts = ref<{ [key: string]: any }>({});

    const buying = reactive<{ [key: string]: boolean }>({});

    const { contractAddress } = ethereumConfig;

    const { currentPrice, mintTime } = usePrice(props.contract);
    const { currentToken, nextToken } = useCurrentAndNextToken();
    const txWatchCallback = (status: number) => {
      if (status == 0) {
        buying[currentToken.value] = false;
        alert(i18n.t("sorryLowGasPrice"));
      }
    };
    const { transactionHash } = useWatchTransaction(
      props.provider,
      txWatchCallback
    );
    const { fire, fireOn } = useFire();

    const updateNftData = async (tokenId: string) => {
      try {
        const dataURI = await props.contract.functions.dataURI(tokenId);
        const data = JSON.parse(
          Buffer.from(dataURI[0].substring(29), "base64").toString("ascii")
        );
        updateNFT(String(tokenId), "data", data);
      } catch (e) {
        updateNFT(String(tokenId), "data", { name: "broken" });
      }
    };
    const updateOwnerData = async (tokenId: string) => {
      props.contract.functions.ownerOf(tokenId).then((owner) => {
        updateNFT(String(tokenId), "owner", owner[0]);
      });
      props.contract.functions.tokenPrice(tokenId).then((price) => {
        updateNFT(String(tokenId), "price", price[0] / 10 ** 18);
      });
      props.contract.functions.seeds(tokenId).then((seed) => {
        updateNFT(
          String(tokenId),
          "bgColor",
          seed.background === 0 ? "bg-nouns-grey" : "bg-nouns-beige"
        );
      });
    };

    const initEvent = () => {
      props.contract.removeAllListeners();
      props.contract.on("NounCreated", (event) => {
        console.log("NounCreated");
        updateNextToken();
      });
      props.contract.on("MintTimeUpdated", (event) => {
        updateMintTime(event.toNumber());
      });
      props.contract.on("NounBought", (tokenId, owner) => {
        updateNFT(tokenId.toString(), "owner", owner);
        if (buying[tokenId.toString()]) {
          if (owner == props.accounts[0]) {
            fire();
          }
        }

        buying[tokenId.toString()] = false;
      });
    };
    initEvent();

    const updateMintTime = (newMintTime: number) => {
      if (newMintTime > mintTime.value) {
        mintTime.value = newMintTime;
      }
    };

    const updateNextToken = async () => {
      props.contract.functions.getMintTime().then((_minttime) => {
        updateMintTime(_minttime[0].toNumber());
      });
      props.contract.functions.getCurrentToken().then((res) => {
        nextToken.value = res[0].toString();
      });
    };

    const updateNFT = (index: string, key: string, nft: any) => {
      const newNfts = { ...nfts.value };
      const newData = { ...nfts.value[index] } || {};
      newData[key] = nft;
      newNfts[index] = newData;
      nfts.value = newNfts;
    };

    watch(currentToken, async () => {
      Promise.all(
        Array.from(Array.from(new Array(10)).keys()).map(async (i: number) => {
          const index = currentToken.value - i;
          if (index >= 0 && !nfts.value[String(index)]) {
            updateNftData(String(index));
            updateOwnerData(String(index));
          }
        })
      );
    });

    const bgColor = computed(() => {
      const nft = nfts.value[currentToken.value];
      if (nft) {
        return nft.bgColor;
      }
      return "bg-nouns-gray";
    });
    watch(bgColor, () => {
      store.commit("setBgColor", bgColor.value);
    });

    updateNextToken();

    const mintNouns = async () => {
      await props.provider.send("eth_requestAccounts", []);

      const signer = props.provider.getSigner();
      const contractWithSigner = new ethers.Contract(
        contractAddress,
        nounsTokenJson.abi,
        signer
      );

      loading.value = true;
      try {
        buying[currentToken.value] = true;
        const res = await contractWithSigner.functions.buy(currentToken.value, {
          value: ethers.utils.parseEther(String(currentPrice.value)),
        });
        transactionHash.value = res.hash;
        updateNextToken();
      } catch (e) {
        console.log(e);
        buying[currentToken.value] = false;
        alert(i18n.t("sorryLowPrice"));
      }
      loading.value = false;
    };

    const nftKeys = computed(() => {
      return Object.keys(nfts.value).sort((a, b) => {
        return Number(a) > Number(b) ? -1 : 1;
      });
    });

    return {
      loading,
      mintNouns,
      contractAddress,

      nfts,
      nftKeys,

      currentPrice,
      currentToken,

      buying,

      fireOn,
      fire,
      bgColor,
    };
  },
});
</script>
