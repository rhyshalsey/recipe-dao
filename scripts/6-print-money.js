const { ethers } = require("ethers");
const sdk = require("./1-initialize-sdk");

const tokenModule = sdk.getTokenModule(
  "0x8cE5E9253D766dfBdA73284793780EC43e063a7d"
);

(async () => {
  try {
    const maxSupply = 1_000_000;
    // Convert the max supply amount to have 18 decimals (ERC20 standard)
    const maxSupplyWithDecimals = ethers.utils.parseUnits(
      maxSupply.toString(),
      18
    );
    // Mint RECP tokens
    await tokenModule.mint(maxSupplyWithDecimals);
    // Get new total supply of RECP tokens
    const totalSupply = await tokenModule.totalSupply();

    console.log(`There are now ${totalSupply} RECP tokens in circulation`);
  } catch (error) {
    console.error("Failed to print RECP tokens", error);
  }
})();
