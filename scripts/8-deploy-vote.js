const sdk = require("./1-initialize-sdk");

const appModule = sdk.getAppModule(
  "0xE6A94118eDEb731386Ccc93618171410BaAb422c"
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: "RecipeDAO proposals",
      votingTokenAddress: "0x8cE5E9253D766dfBdA73284793780EC43e063a7d",
      // Delay after proposal is created when users can start voting on it
      proposalStartWaitTimeInSeconds: 0,
      // How long the proposal lasts for (24 hours)
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      // Percentage of tokens needed in vote to pass a proposal
      votingQuorumFraction: 0,
      // Minimum number of tokens needed to create a proposal
      minimumNumberOfTokensNeededToPropose: "0",
    });

    console.log(
      "Successfully deployed vote module. Address: ",
      voteModule.address
    );
  } catch (error) {
    console.error("Failed to deploy vote module", err);
  }
})();

// Vote module address
// 0xa8c510944a923F8ED225ef47965f59e7A12CFe16
