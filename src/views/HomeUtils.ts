import { ref, computed } from "vue";

import { ethers } from "ethers";

import { useTimerBase, currentTime} from "../utils/utils";

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
