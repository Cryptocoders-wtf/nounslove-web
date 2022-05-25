<template>
  <div class="home">
    <div class="justify-center items-center font-pt-root">
      <!-- Use Tailwind CSS h-40 (=10rem=160px) instead of .logo. -->
      <Animation 
        v-show="fireOn"
        />
      <div v-if="!hasMetaMask">
        Please install MetaMask.
      </div>
      <div v-else class="ml-0">

        <!-- on sale noun -->
        <div v-if="currentToken == 0">
          <button @click="mintNouns" 
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  
                  >Get Your Noun</button>
        </div>
        <div v-if="nfts[currentToken]" class="sm:flex">
          
          <div class="relative sm:w-1/2 w-full" :class="bgColor">
            <a :href="`https://testnets.opensea.io/assets/${contractAddress}/${currentToken}`" target="_blank">
              <img :src="nfts[currentToken].data?.image" class="w-full" />
            </a>
          </div>
          <div class="flex flex-1 flex-col bg-white sm:w-1/2 w-full" :class="bgSmColor">
            <span class="text-red-600 font-bold">
              Now accepting bids
            </span>

            <div class="text-left font-londrina text-4xl">
              {{nfts[currentToken].data?.name}}<br/>
            </div>
            <div class="text-left font-bold">
              {{nfts[currentToken].data?.description}}
            </div>

            <div class="font-bold">
              Current Price: {{ currentPrice }} Eth
            </div>
            <div v-if="buying[currentToken]">
              <span class="text-red-600 font-bold">
                You are buying....
                <div className="flex justify-center">
                  <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              </span>
            </div>
            <div v-else-if="loading" :class="bgColor">
              Processing...
            </div>
            <div v-else>
              <button @click="mintNouns" 
                      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      
                      >Get Your Noun</button>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="relative w-full h-60" :class="bgColor">
            <div class="pt-6 font-londrina text-4xl">
              minting new one....
              <div className="flex justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            </div>
          </div>
        </div>
        <!-- end of on sale -->
      
        <div class="mt-2">
          <div v-for="(tokenId, key) in nftKeys" :key="key" class="mb-2">
            <template v-if="tokenId != currentToken">
              <div class="flex">
                <div class="flex-1">
                  <a :href="`https://testnets.opensea.io/assets/${contractAddress}/${tokenId}`" target="_blank">
                    <img :src="nfts[tokenId].data?.image" class="w-1/2 m-auto" />
                  </a>
                </div>
                <div class="flex-1">
                  <div>
                  <span v-if="accounts.includes(nfts[tokenId]?.owner)" class="text-red-600 font-bold">
                    💖You wons!!
                  </span>
                </div>
                  <div class="text-left font-londrina text-4xl">
                    {{nfts[tokenId].data?.name}}<br/>
                  </div>
                  <div class="text-left font-bold">
                    {{nfts[tokenId].data?.description}}
                  </div>
                  <div class="text-left">
                    Held by 
                    <span v-if="accounts.includes(nfts[tokenId]?.owner)" class="text-red-600 font-bold">
                      {{(nfts[tokenId].owner||"").substr(0, 10)}}<br/>
                    </span>
                    <span v-else>
                      {{(nfts[tokenId].owner||"").substr(0, 10)}}<br/>
                    </span>
                  </div>
                  <div class="text-left">
                    💖Winning Price {{nfts[tokenId].price}}
                  </div>
                </div>
              </div>
            </template>              
          </div>
        </div>
        
      </div>
      <!-- end of show -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, computed } from "vue";
import { ethers } from "ethers";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nounsTokenJson = require("./NounsTokenLocal.json");
import { useTimerBase, currentTime, sleep } from "../utils/utils";

import Animation from "./Animation.vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "HomePage",
  components: {
    Animation,
  },
  setup() {
    const store = useStore();
    const loading = ref(false);
     
    const nextToken = ref(0);
    // const contractAddress = "0x1c9fD50dF7a4f066884b58A05D91e4b55005876A"; // desc for actual nouns for local
    const contractAddress = "0x1602155eB091F863e7e776a83e1c330c828ede19"; // desc for actual nouns // for rinkeby
    
    const mintTime = ref(0);
    const nfts = ref<{[key: string]: any}>({});

    const maxPrice = ref(1);
    const minPrice = ref(0.005);
    const priceDelta = ref(0.015);
    const timeDelta = ref(60); // second
    
    const accounts = ref<string[]>([]);
    const buying = reactive<{[key: string]: boolean}>({});
    const wons = reactive<{[key: string]: boolean}>({});

    const backgroundColor = ref("");

    const fireOn = ref(false);
    const fire = async () => {
      fireOn.value = true;
      await sleep(7);
      fireOn.value = false;
      
    };
    
    const hasMetaMask = !!((window as any).ethereum);
    if (!hasMetaMask) {
      return { hasMetaMask: false, fireOn: false};
    }
    const ethereum = (window as any).ethereum;
    ethereum.on('accountsChanged', (accounts: any) => {
      console.log("AA");
    });
    ethereum.on('chainChanged', (chainId: string) => {
      console.log(chainId);
    });

    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const contract = new ethers.Contract(contractAddress, nounsTokenJson.abi, provider);
    
    
    const now = useTimerBase(currentTime);
    
    const updateNftData = async (tokenId: string) => {
      try {
        const dataURI = await contract.functions.dataURI(tokenId);
        const data = JSON.parse(
          Buffer.from(dataURI[0].substring(29), 'base64').toString('ascii'),
        );
        updateNFT(String(tokenId), "data", data);
      } catch(e) {
        updateNFT(String(tokenId), "data", {name: "broken"});
      }
    };
    const updateOwnerData = async (tokenId: string) => {
      const owner = await contract.functions.ownerOf(tokenId);
      updateNFT(String(tokenId), "owner", owner[0]);
      const price = await contract.functions.tokenPrice(tokenId);
      updateNFT(String(tokenId), "price", (price[0] / (10**18)));
      const seed = await contract.functions.seeds(tokenId);

      updateNFT(String(tokenId), "bgColor", seed.background === 0 ? "bg-nouns-grey" : "bg-nouns-beige" ); 
      
      return owner[0];
    };
    
    contract.on("NounCreated", (event) => {
      updateNextToken();
    });
    contract.on("MintTimeUpdated", (event) => {
      updateMintTime(event.toNumber());
    });
    contract.on("NounBought", (tokenId, owner) => {
      console.log("buy", tokenId);
      updateNFT(tokenId.toString(), "owner", owner);
      if (buying[tokenId.toString()]) {
        console.log(owner, accounts.value[0]);
        if (owner == accounts.value[0]) {
          // alert("you won");
          fire();
          wons[tokenId.toString()] = true;
        }
      }
          
      buying[tokenId.toString()] = false;
    });
    const updateMintTime = (newMintTime: number) => {
      if (newMintTime > mintTime.value) {
        mintTime.value = newMintTime
      }
    };
    
    const updateNextToken = async () => {
      const _minttime = await contract.functions.getMintTime();
      updateMintTime(_minttime[0].toNumber());
      const res = await contract.functions.getCurrentToken();
      nextToken.value = res[0].toString();
      console.log(currentToken.value);


    };
    
    const currentToken = computed(() => {
      if (nextToken.value > 0) {
        return nextToken.value - 1;
      }
      return 0;
    });

    const updateNFT = (index: string, key: string, nft: any) => {
      const newNfts = {...nfts.value}
      const newData = {...nfts.value[index]} || {};
      newData[key] = nft;
      newNfts[index] = newData;
      nfts.value = newNfts;
      
    };
    const initPrice = async () => {
      const priceData = await contract.functions.getPriceData();
      const [a, b, c, d, e] = priceData[0];
      
      maxPrice.value = a / (10**18);
      minPrice.value = b / (10**18);
      priceDelta.value = c / (10**18);
      
      accounts.value = await provider.listAccounts();
    };
    initPrice();
    
    const currentPrice = computed(() => {
      const timeDelta = 60; // second
      
      const timeDiff = now.value - mintTime.value - 300;
      if (timeDiff < timeDelta ) {
        return maxPrice.value;
      }
      const priceDiff = (Math.round(timeDiff / timeDelta)  )* priceDelta.value;
      if (priceDiff >= maxPrice.value - minPrice.value) {
        return minPrice.value;
      }
      return Math.round((maxPrice.value - priceDiff) * (10 ** 8))/ (10 ** 8) ;

    });
    
    watch(currentToken, async () => {
      const arr = [0, 1, 2, 3,4,5,6,7,8,9];
      await Promise.all(arr.map(async (i: number) => {
        const index = currentToken.value - i;
        if (index >= 0 && !nfts.value[String(index)]) {
          updateNftData(String(index));
          updateOwnerData(String(index));
        }
      }));
    });
    
    const bgColor = computed(() => {
      const nft = nfts.value[currentToken.value];
      if (nft) {
        return nft.bgColor;
      }
      return "bg-nouns-gray";
      //currentToken.value 
    });
    const bgSmColor = computed(() => {
      return "sm:" + bgColor.value;
    });
    watch(bgColor, () => {
      store.commit("setBgColor", bgColor.value);
    });
    updateNextToken();

    const mintNouns = async () => {
      await provider.send("eth_requestAccounts", []);
      
      const signer = provider.getSigner()
      const contractWithSigner = new ethers.Contract(contractAddress, nounsTokenJson.abi, signer);

      loading.value = true
      try {
        if (currentToken.value == 0) {
          await contractWithSigner.functions.mint();
        } else {
          buying[currentToken.value] = true;
          const options = {value: ethers.utils.parseEther(String(currentPrice.value))}
          const res = await contractWithSigner.functions.buy(currentToken.value, options);
          console.log(res.hash);
        }
        await updateNextToken();

      } catch(e) {
        console.log(e);
        alert("sorry. Someone has won or the bid price is low.");
      }
      loading.value = false;
    };

    const nftKeys = computed(() => {
      return Object.keys(nfts.value).sort((a, b) => {
        return Number(a) > Number(b) ? -1 : 1;
      });
    });

    return {
      hasMetaMask,
      loading,
      mintNouns,
      contractAddress,

      nfts,
      nftKeys,

      currentPrice,
      currentToken,

      accounts,
      buying,
      wons,

      fireOn,
      
      bgColor,
      bgSmColor,
    }
  },
});
</script>
