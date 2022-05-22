<template>
  <div class="home">
    <div class="justify-center items-center space-x-8">
      <!-- Use Tailwind CSS h-40 (=10rem=160px) instead of .logo. -->
      <div v-if="!hasMetaMask">
        Please install MetaMask.
      </div>
      <div v-else class="mx-8">
        <div v-if="loading">
          Processing...
        </div>
        <div v-else>
          <div>
            Current Price: {{ currentPrice }} Eth</div>
          <button @click="mintNouns" 
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"

                  >Get Your Noun</button>
        </div>

        <div class="mt-2">
          <div v-if="!nftKeys.includes(String(currentToken))">
            minting new one....
          </div>
          <div v-for="(tokenId, key) in nftKeys" :key="key" class="mb-2">
            <div class="flex">

              <div class="flex-1">
                <a :href="`https://testnets.opensea.io/assets/${contractAddress}/${tokenId}`" target="_blank">
                  <img :src="nfts[tokenId].data?.image" class="w-120" v-if="String(currentToken) == tokenId" />
                  <img :src="nfts[tokenId].data?.image" class="w-32" v-else/>
                </a>
              </div>
              <div class="flex-1">
                <span v-if="wons[tokenId]" class="text-red-600 font-bold">
                  You wons!!
                </span>
                <span v-else-if="buying[tokenId]" class="text-red-600 font-bold">
                  You are buying....
                </span>
                <span v-else-if="currentToken == tokenId" class="text-red-600 font-bold">
                  Now accepting bids
                </span><br/>
                {{nfts[tokenId].data?.name}}<br/>
                {{nfts[tokenId].data?.description}}
                <span v-if="accounts.includes(nfts[tokenId]?.owner)" class="text-red-600 font-bold">
                  {{(nfts[tokenId].owner||"").substr(0, 10)}}<br/>
                </span>
                <span v-else>
                  {{(nfts[tokenId].owner||"").substr(0, 10)}}<br/>
                </span>
              </div>
            </div>
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



import { useTimerBase, currentTime } from "../utils/utils";

export default defineComponent({
  name: "HomePage",
  components: {
    
  },
  setup() {
    const loading = ref(false);
     
    const nextToken = ref(0);
    // const contractAddress = "0x8B190573374637f144AC8D37375d97fd84cBD3a0"; // desc for actual nouns for local
    const contractAddress = "0xA409B4d308D6234b1E47b63ae1AEbE4fb5030D2a"; // desc for actual nouns // for rinkeby
    
    const mintTime = ref(0);
    const nfts = ref<{[key: string]: any}>({});

    const maxPrice = ref(1);
    const minPrice = ref(0.005);
    const priceDelta = ref(0.015);
    const timeDelta = ref(60); // second
    
    const accounts = ref<string[]>([]);
    const buying = reactive<{[key: string]: boolean}>({});
    const wons = reactive<{[key: string]: boolean}>({});
    
    const hasMetaMask = !!((window as any).ethereum);
    if (!hasMetaMask) {
      return { hasMetaMask: false};
    }
    
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const contract = new ethers.Contract(contractAddress, nounsTokenJson.abi, provider);
    
    
    const now = useTimerBase(currentTime);
    
    const updateNftData = async (tokenId: string) => {
      const dataURI = await contract.functions.dataURI(tokenId);
      const data = JSON.parse(
        Buffer.from(dataURI[0].substring(29), 'base64').toString('ascii'),
      );
      updateNFT(String(tokenId), "data", data);
    };
    const updateOwnerData = async (tokenId: string) => {
      const owner = await contract.functions.ownerOf(tokenId);
      updateNFT(String(tokenId), "owner", owner[0]);
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
          alert("you won");
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
      return maxPrice.value - priceDiff;

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
          await contractWithSigner.functions.buy(currentToken.value, options);
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
        return a > b ? -1 : 1;
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
    };
  },
});
</script>
