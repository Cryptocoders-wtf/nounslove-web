import express from "express";
import * as admin from "firebase-admin";

import * as fs from "fs";

import sharp from "sharp";
import { ethers } from "ethers";
import nounsTokenJson from "./NounsToken";

export const app = express();

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const nounPage = async (req: any, res: any) => {
  const { tokenId } = req.params;
  const template_data = fs.readFileSync("./templates/index.html", {
    encoding: "utf8",
  });

  if (!/^[0-9]+$/.test(tokenId)) {
    return res.status(404).send(template_data);
  }

  const imageUrl = "https://nouns.love/api/image/" + tokenId;
  const url = '<meta property="og:url" content="https://nouns.love/noun/' + tokenId + '" />';
  res.send(
    template_data
      .replaceAll("https://nouns.love/banner2.jpeg", imageUrl)
      .replaceAll('<meta property="og:url" content="https://nouns.love/"/>', url)
  );
};

const getNFT = async (tokenId: string) => {
  const contractAddress = "0xb1B25Eeb1026cB947b3f65a5cc123FC28B13EEe6"; // nouns love contract

  const provider = new ethers.providers.AlchemyProvider();
  const contract = new ethers.Contract(
    contractAddress,
    nounsTokenJson.abi,
    provider,
  );
  const dataURI = await contract.functions.dataURI(tokenId);
  const imageData = JSON.parse(
    Buffer.from(dataURI[0].split(",")[1], "base64").toString("ascii")
  );
  const svg = Buffer.from(imageData.image.split(",")[1], 'base64').toString("ascii");
  return svg;
};

const saveImageCache = async (tokenId: string, data: any) => {
  const base64Data = Buffer.from(data).toString('base64');
  await db.doc(`imageCache/${tokenId}`).set({
    data: base64Data,
  });
};

const image = async (req: any, res: any) => {
  const { imageId } = req.params;
  if (!/^[0-9]+$/.test(imageId)) {
    return res.status(404).send("not found");
  }
  // get cache
  const imageDoc = await db.doc(`imageCache/${imageId}`).get();
  const image = await (async () => {
    if (!imageDoc.exists) {
      console.log("not hit");
      const svgText = await getNFT(imageId);
      
      const pngBinary = await sharp(Buffer.from(svgText)).png().toBuffer();
      // save data
      await saveImageCache(imageId, pngBinary);
      return pngBinary;
    } else {
      const cache = imageDoc.data() ||{};
      
      const image = Buffer.from(cache.data, "base64")
      //const data = await sharp(Buffer.from(svg)).png().toBuffer();
      return image;
    }
  })();

  res.setHeader('Content-Type', 'image/png');
  res.type('png');
  res.send(image);
};

app.get("/noun/:tokenId", nounPage);
app.get("/api/image/:imageId", image);

