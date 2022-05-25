<template>
  <div class="text-left font-pt-root mx-8 mt-4" v-if="lang === 'ja'">
    <p class="mb-2">
      このサービスは、手軽に Nounish NFT
      を手に入れていただくために作ったオークション形式のミント・サイトです。
      「ダッチオークション」と呼ばれる方式で、新たにミントしたNFTを、まずは1ETHで売り出し、
      時間とともに徐々に値段を下げ、買い手がついたところで、次のNFTをミントします。
    </p>
    <p>
      このオークションでの売り上げは、全て 「<a
        href="https://nounsfes.org"
        class="underline"
        >Nouns Art Festival (NounsFes)</a
      >」
      の運営(主に賞金)に当てられます。NounsFesは、非営利なオンライン映画祭で、愛と平和とSDGsをテーマにした短編映像を表彰するものです。
      ここで発行されたNFTを持った方々には、審査員として参加していただくことを予定しています。
    </p>
  </div>
  <div class="text-left font-pt-root mx-8 mt-4" v-else>
    <p class="mb-2">
      This is a minting service for people who want to have affordable Nounish
      NFTs. A newly minted NFT will be priced at 1ETH initiallly, and the price
      will go down gradually until somebody purchases it (Dutch Auction).
    </p>
    <p>
      All the proceed from this auction will be used for
      <a href="https://nounsfes.org" class="underline"
        >Nouns Art Festival (NounsFes)</a
      >
      , which is a non-profit online video festival, honoring short videosm
      which promotes love, pease and SDGs. We have a plan to create a mechanism
      for NFT holders to participate as judges.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const i18n = useI18n();

    const lang = computed(() => {
      return i18n.locale.value;
    });
    return {
      lang,
    };
  },
});
</script>
