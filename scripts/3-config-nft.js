import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x85e27823CdD49cBf4cDC3F6C00776E1C3CD48737"
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Whipping up some dough",
        description: "This NFT will give you access to RecipeDAO! ",
        image: readFileSync("scripts/assets/chef.jpg"),
      },
    ]);

    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();
