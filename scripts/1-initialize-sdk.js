import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

import dotenv from "dotenv";
dotenv.config();

if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY == "") {
  console.log("🛑 Private key not found.");
}

if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL == "") {
  console.log("🛑 Alchemy API URL not found.");
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS == "") {
  console.log("🛑 Wallet Address not found.");
}

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    // Your wallet private key. ALWAYS KEEP THIS PRIVATE
    process.env.PRIVATE_KEY,
    ethers.getDefaultProvider(process.env.ALCHEMY_API_URL)
  )
);

(async () => {
  try {
    const apps = await sdk.getApps();
    console.log("Your app address is:", apps[0].address);
  } catch (e) {
    console.error("Failed to get apps from the sdk", e);
    process.exit(1);
  }
})();

export default sdk;

//  0xE6A94118eDEb731386Ccc93618171410BaAb422c
