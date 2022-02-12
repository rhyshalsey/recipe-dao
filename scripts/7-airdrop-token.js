const { ethers } = require("ethers");
const sdk = require("./1-initialize-sdk");

const bundleDropModule = sdk.getBundleDropModule(
  "0x85e27823CdD49cBf4cDC3F6C00776E1C3CD48737"
);

const tokenModule = sdk.getTokenModule(
  "0x8cE5E9253D766dfBdA73284793780EC43e063a7d"
);

(async () => {
  try {
    // Get all holders of the membership NFT (tokenId 0)
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

    if (walletAddresses.length <= 0) {
      console.info(
        "Nobody has claimed the free membership NFT :( No airdrops will be distributed."
      );
      process.exit(0);
    }

    const airdropTargets = walletAddresses.map((address) => {
      // Pick a random # between 1000 and 10000.
      const airdropAmount = Math.floor(
        Math.random() * (10000 - 1000 + 1) + 1000
      );
      console.info(`Going to airdrop ${airdropAmount} tokens to ${address}`);

      const airdropTarget = {
        address,
        // Add 18 decimal places to the airdrop amount
        amount: ethers.utils.parseUnits(airdropAmount.toString(), 18),
      };

      return airdropTarget;
    });

    console.info("Starting airdrop...");

    await tokenModule.transferBatch(airdropTargets);

    console.info("Succesfully airdropped tokens to all NFT holders");
  } catch (error) {
    console.error("Failed to airdrop tokens to NFT holders", error);
  }
})();
