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
    const amount = 420_000;

    // Create proposal to mint 420,000 new token to the treasury.
    await voteModule.propose(
      `Should the DAO mint an additional ${amount} tokens into the treasury?`,
      [
        {
          // Native token is ETH. How many ETH do we want to send in this proposal?
          // Zero because we are proposing to mint new tokens
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "mint",
            [voteModule.address, ethers.utils.parseUnits(amount.toString(), 18)]
          ),
          toAddress: tokenModule.address,
        },
      ]
    );

    console.log("Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("Failed to create first proposal", error);
    process.exit(1);
  }

  try {
    const amount = 6_900;
    // Create proposal to transfer ourselves 6,900 tokens
    await voteModule.propose(
      `Should the DAO transfer ${amount} tokens from the treasury to ${process.env.WALLET_ADDRESS}?`,
      [
        {
          // Sending our own token, not ETH
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "transfer",
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),
          toAddress: tokenModule.address,
        },
      ]
    );

    console.log(
      "Successfully created proposal to reward ourselves from the treasury"
    );
  } catch (error) {
    console.error("Failed to create second proposal", error);
  }
})();
