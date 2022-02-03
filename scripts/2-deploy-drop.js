import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const app = sdk.getAppModule("0xE6A94118eDEb731386Ccc93618171410BaAb422c");

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: "RecipeDAO Membership",
      description: "A DAO for people who love good food",
      image: readFileSync("scripts/assets/recipe.jpg"),
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });

    console.log(
      "✅ Successfully deployed bundleDrop module, address:",
      bundleDropModule.address
    );

    console.log(
      "✅ bundleDrop metadata:",
      await bundleDropModule.getMetadata()
    );
  } catch (error) {
    console.log("failed to deploy bundleDrop module", error);
  }
})();

// 0x85e27823CdD49cBf4cDC3F6C00776E1C3CD48737
