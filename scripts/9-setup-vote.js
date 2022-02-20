const { ethers } = require("ethers");
const sdk = require("./1-initialize-sdk");

const voteModule = sdk.getVoteModule(
  "0xa8c510944a923F8ED225ef47965f59e7A12CFe16"
);

const tokenModule = sdk.getTokenModule(
  "0x8cE5E9253D766dfBdA73284793780EC43e063a7d"
);

(async () => {
  try {
    // Give treasury ability to mind tokens
    await tokenModule.grantRole("minter", voteModule.address);

    console.log(
      "Successfully gave vote module permissions to act on token module"
    );
  } catch (error) {
    console.error(
      "Failed to grand vote module permissions on token module",
      error
    );
    process.exit(1);
  }

  try {
    // Get our wallet's token balance
    const ownedTokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );

    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    // Transfer 90% of supply to voting contract
    await tokenModule.transfer(voteModule.address, percent90);

    console.log("Successfully transfered tokens to vote module");
  } catch (error) {
    console.error("Failed to transfer tokens to vote module. ", error);
  }
})();
