const sdk = require("./1-initialize-sdk.js");

const app = sdk.getAppModule("0xE6A94118eDEb731386Ccc93618171410BaAb422c");

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      name: "Recipe Token",
      symbol: "RECP",
    });

    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address
    );
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();

// Token module address
// 0x8cE5E9253D766dfBdA73284793780EC43e063a7d
