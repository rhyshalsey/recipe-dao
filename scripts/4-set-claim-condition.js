import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0x85e27823CdD49cBf4cDC3F6C00776E1C3CD48737"
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();

    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 50_000,
      maxQuantityPerTransaction: 1,
    });

    await bundleDrop.setClaimCondition(0, claimConditionFactory);

    console.log(
      "✅ Successfully set claim condition on bundle drop:",
      bundleDrop.address
    );
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }
})();
