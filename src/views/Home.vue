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

  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
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
    const contractAddress = "0x071586BA1b380B00B793Cc336fe01106B0BFbE6D"; // desc for actual nouns
    const contract = new web3.eth.Contract(nounsTokenJson.abi, contractAddress); 

    const getCurrentToken3 = async () => {
      const id = await contract.methods.price().call();
      console.log(id)

      currentToken.value = await contract.methods.getCurrentToken().call();
      console.log(currentToken.value);
    };

    getCurrentToken3();

    const mintNouns = async () => {
      const acccounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const sender_address = acccounts[0];

      let gas = 20145300;
      let gasPrice = '194000001700';
      const tx = {
        'from': sender_address,
        'to': contractAddress,
        // 'chainId': chainId,
        value: web3.utils.toWei("1", "ether"),
        'gas': gas,
        'gasPrice': gasPrice,
        'data': contract.methods.buy(currentToken.value - 1).encodeABI()
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


    return {
      hasMetaMask,
      loading,
      mintNouns,
      nftData,
      tokenId,
      contractAddress,
    };
  },
});
</script>
