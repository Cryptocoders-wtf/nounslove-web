<template>
  <div class="home">
    <div class="justify-center items-center space-x-8">
      <!-- Use Tailwind CSS h-40 (=10rem=160px) instead of .logo. -->
      <div v-if="!hasMetaMask">
        Please install MetaMask.
      </div>
      <div v-else>
        <div v-if="loading">
          Minting...
        </div>
        <div v-else>
          <button @click="mintNouns" 
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"

                  >Mint Your Noun</button>
        </div>
      </div>
      <div v-if="nftData && !loading">
        <div v-if="tokenId">
          <a :href="`https://testnets.opensea.io/assets/${contractAddress}/${tokenId}`" target="_blank">OpenSea Link</a>
        </div>
        <div>{{nftData.name}}</div>
        <div>{{nftData.description}}</div>
        <div class="text-center">
          <img :src="nftData.image" />
        </div>
      </div>
    </div>
    <div v-for="(tokenId, key) in nftKeys" :key="key">
      <img :src="nfts[tokenId].image" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import Web3 from "web3";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nounsTokenJson = require("./NounsTokenLocal.json");
                              
//const chainId = '3';
const chainId = 1337;

// import { INounsSeeder } from './interfaces/INounsSeeder.sol';


export default defineComponent({
  name: "HomePage",
  components: {

  },
  setup() {
    const loading = ref(false);
    const web3 = new Web3('http://localhost:8545');
    const hasMetaMask = Web3.givenProvider.isMetaMask;

    const tokenId = ref();
    const res = ref();
    const nftData = ref();
    const currentToken = ref(0);
    const contractAddress = "0x1780bCf4103D3F501463AD3414c7f4b654bb7aFd"; // desc for actual nouns
    const contract = new web3.eth.Contract(nounsTokenJson.abi, contractAddress); 

    const nfts = ref<{[key: string]: any}>({});

    /*
    contract.getPastEvents("NounCreated", console.log);
    contract.events.NounCreated().on('data', (event: any) => {
        console.log(event);
      })
      .on('error', console.error);
    */
    
    const getCurrentToken3 = async () => {
      // const id = await contract.methods.price().call();
      // console.log(id)

      currentToken.value = await contract.methods.getCurrentToken().call();
      console.log(currentToken.value);
    };
    const updateNFT = (index: string, nft: any) => {
      const newNfts = {...nfts.value}
      newNfts[index] = nft;
      nfts.value = newNfts;
      
    };
    watch(currentToken, async () => {
      const arr = [0, 1, 2, 3,4,5,6,7,8,9];
      await Promise.all(arr.map(async (i: number) => {
        const index = currentToken.value -1 - i;
        if (index > 0 && !nfts.value[String(index)]) {
          const dataURI = await contract.methods.dataURI(index).call();
          const data = JSON.parse(
            Buffer.from(dataURI.substring(29), 'base64').toString('ascii'),
          );
          updateNFT(String(index), data);
          console.log(data);
          console.log(data.image)
          // svgData.value = data.image;
          
          console.log(index);
        }
      }));
    });
    
    getCurrentToken3();

    const mintNouns = async () => {
      const acccounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const sender_address = acccounts[0];
      
      console.log(currentToken.value);
      console.log(currentToken.value === 0)
      const method = (currentToken.value == 0) ?
        contract.methods.mint().encodeABI() :
        contract.methods.buy(currentToken.value - 1).encodeABI()

      let gas = 20145300;
      let gasPrice = '194000001700';
      const tx = {
        'from': sender_address,
        'to': contractAddress,
        // 'chainId': chainId,
        value: web3.utils.toWei("0.9", "ether"),
        'gas': gas,
        'gasPrice': gasPrice,
        'data': method,
      } as any;
      console.log(tx);
      loading.value = true;
      try {
        const res = await web3.eth.sendTransaction(tx);
        console.log(res);
        await getCurrentToken3();

      } catch(e) {
        console.log(e);
        alert("sorry");
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
      nftData,
      tokenId,
      contractAddress,

      nfts,
      nftKeys,
    };
  },
});
</script>
