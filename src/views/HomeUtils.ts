import { ref, computed, watch, Ref } from "vue";

import { ethers } from "ethers";

import { NFT, NFTData } from "./types";

import { useTimerBase, currentTime } from "@/utils/utils";
import { sleep } from "@/utils/utils";

export const usePrice = (contract: ethers.Contract) => {
  const mintTime = ref(0);

  const maxPrice = ref(1);
  const minPrice = ref(0.005);
  const priceDelta = ref(0.015);
  const timeDelta = ref(60); // second

  const now = useTimerBase(currentTime);

  const initPrice = async (_contract: ethers.Contract) => {
    const priceData = await _contract.functions.getPriceData();
    const [a, b, c, d, e] = priceData[0];
    maxPrice.value = a / 10 ** 18;
    minPrice.value = b / 10 ** 18;
    priceDelta.value = c / 10 ** 18;
    timeDelta.value = d.toNumber();
  };

  const currentPrice = computed(() => {
    const timeDiff = now.value - mintTime.value - 300;
    if (timeDiff < timeDelta.value) {
      return maxPrice.value;
    }
    const priceDiff = Math.round(timeDiff / timeDelta.value) * priceDelta.value;
    if (priceDiff >= maxPrice.value - minPrice.value) {
      return minPrice.value;
    }
    return Math.round((maxPrice.value - priceDiff) * 10 ** 8) / 10 ** 8;
  });
  initPrice(contract);

  return {
    currentPrice,
    initPrice,
    mintTime,
  };
};

export const useWatchTransaction = (
  provider: ethers.providers.Web3Provider | ethers.providers.AlchemyProvider,
  callback: (status: number) => void
) => {
  const transactionHash = ref("");

  const watchTransaction = async (hash: string) => {
    let loop = true;

    while (loop) {
      await sleep(5);
      const receipt = await provider.getTransactionReceipt(hash);
      if (receipt) {
        loop = false;
        if (receipt.status) {
          callback(receipt.status);
        }
      }
      console.log("loop");
    }
  };
  watch(transactionHash, () => {
    if (transactionHash.value) {
      watchTransaction(transactionHash.value);
    }
  });
  return {
    transactionHash,
  };
};

export const useFire = () => {
  const fireOn = ref(false);
  const fire = async () => {
    fireOn.value = true;
    await sleep(7);
    fireOn.value = false;
  };
  return { fire, fireOn };
};

export const useCurrentAndNextToken = () => {
  const nextToken = ref(0);
  const currentToken = computed(() => {
    if (nextToken.value > 0) {
      return nextToken.value - 1;
    }
    return 0;
  });

  return {
    nextToken,
    currentToken,
  };
};

export const useNFTs = (contract: ethers.Contract) => {
  const nfts = ref<{ [key: string]: NFTData }>({});

  const updateNFT = (
    index: string,
    key: string,
    nft: NFT | number | string
  ) => {
    const newNfts = { ...nfts.value };
    const newData = { ...nfts.value[index] } || {};
    newData[key as keyof NFTData] = nft as never;
    newNfts[index] = newData;
    nfts.value = newNfts;
  };

  const updateNftData = async (tokenId: string) => {
    try {
      const dataURI = await contract.functions.dataURI(tokenId);
      const data = JSON.parse(
        Buffer.from(dataURI[0].substring(29), "base64").toString("ascii")
      );
      updateNFT(String(tokenId), "data", data);
    } catch (e) {
      console.log(e);
      updateNFT(String(tokenId), "data", {
        name: "broken",
        image: "",
        description: "",
      });
    }
  };

  const updateOwnerData = async (tokenId: string) => {
    contract.functions.ownerOf(tokenId).then((owner) => {
      updateNFT(String(tokenId), "owner", owner[0]);
    });
    contract.functions.tokenPrice(tokenId).then((price) => {
      updateNFT(String(tokenId), "price", price[0] / 10 ** 18);
    });
    contract.functions.seeds(tokenId).then((seed) => {
      updateNFT(
        String(tokenId),
        "bgColor",
        seed.background === 0 ? "bg-nouns-grey" : "bg-nouns-beige"
      );
    });
  };

  return {
    nfts,
    updateNFT,
    updateNftData,
    updateOwnerData,
  };
};
