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
const nounsTokenJson11 = require("./NounsTokenb75Ea83B3823052CC4Eac3399584B629ee410F05.json");

const chainId = '3';

export default defineComponent({
  name: "HomePage",
  components: {

  },
  setup() {
    const loading = ref(false);
    const web3 = new Web3((window as any).ethereum);
    const hasMetaMask = Web3.givenProvider.isMetaMask;

    const tokenId = ref();
    const res = ref();
    const nftData = ref();
    const contractAddress = "0xb75Ea83B3823052CC4Eac3399584B629ee410F05";

    const contract = new web3.eth.Contract(nounsTokenJson11.abi,contractAddress);

    const getCurrentToken = async () => {
      const id = await contract.methods.getCurrentToken().call();
      tokenId.value = id - 1;
      const dataURI = await contract.methods.dataURI(tokenId.value).call();

      const acccounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const a = await contract.methods.ownerOf(tokenId.value).call();
      console.log(a, acccounts);

      nftData.value = JSON.parse(
        Buffer.from(dataURI.substring(29), 'base64').toString('ascii'),
      );
      const svg = Buffer.from(nftData.value.image.substring(26), 'base64');

    };
    getCurrentToken();
    const mintNouns = async () => {
      const acccounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

      const sender_address = acccounts[0];

      const tx = {
        'from': sender_address,
        'to': contractAddress,
        'chainId': chainId,
         value: web3.utils.toWei("0.01", "ether"),
        'data': contract.methods.mint2().encodeABI()
      } as any;
      
      loading.value = true;
      try {
        const res = await web3.eth.sendTransaction(tx);
        console.log(res);
        await getCurrentToken();
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
