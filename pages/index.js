import { useCallback, useEffect, useMemo, useState } from "react";

import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

const sdk = new ThirdwebSDK("rinkeby");

const bundleDropModule = sdk.getBundleDropModule(
  "0x85e27823CdD49cBf4cDC3F6C00776E1C3CD48737"
);

const tokenModule = sdk.getTokenModule(
  "0x8cE5E9253D766dfBdA73284793780EC43e063a7d"
);

export default function Home() {
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address);

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider && provider.getSigner();

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [memberAddresses, setMemberAddresses] = useState([]);

  const memberList = useMemo(
    () =>
      memberAddresses.map((address) => ({
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0,
          18
        ),
      })),
    [memberAddresses, memberTokenAmounts]
  );

  const getNftMemberAddresses = async () => {
    try {
      const addresses = await bundleDropModule.getAllClaimerAddresses("0");
      setMemberAddresses(addresses);
    } catch (error) {
      console.error("Unable to get NFT members list");
    }
  };

  const getMemberTokenBalances = async () => {
    try {
      const holderBalances = await tokenModule.getAllHolderBalances();
      setMemberTokenAmounts(holderBalances);
    } catch (error) {
      console.error("Unable to get token holder balances", error);
    }
  };

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    getNftMemberAddresses();
    getMemberTokenBalances();
  }, [hasClaimedNFT]);

  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  const checkUserHasNFT = useCallback(async () => {
    if (!address) {
      return;
    }

    try {
      const balance = await bundleDropModule.balanceOf(address, "0");

      if (balance.gt(0)) {
        setHasClaimedNFT(true);
        console.info("This user has the membership NFT minted");
      } else {
        setHasClaimedNFT(false);
        console.info("This user does not have the membership NFT minted");
      }
    } catch (error) {
      // TODO Add user facing error
      setHasClaimedNFT(false);
      console.error("Failed to get the membership NFT balance", error);
    }
  }, [address]);

  useEffect(() => {
    checkUserHasNFT();
  }, [checkUserHasNFT]);

  const mintNFT = async () => {
    setIsClaiming(true);

    try {
      await bundleDropModule.claim("0", 1);

      setHasClaimedNFT(true);

      console.log(
        `Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address.toLowerCase()}/0`
      );
    } catch (error) {
      // TODO: Add a user facing error
      console.error("Failed to claim NFT");
    } finally {
      setIsClaiming(false);
    }
  };

  // User is not connected, show connect wallet button
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to Recipe DAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  if (!hasClaimedNFT) {
    return (
      <div className="mint-nft">
        <h1>Mint your free RecipeDAO membership NFT</h1>
        <button disabled={isClaiming} onClick={mintNFT}>
          {isClaiming ? "Minting..." : "Mint your NFT (free)"}
        </button>
      </div>
    );
  }

  return (
    <div className="member-page">
      <h1>RecipeDAO member page</h1>
      <p>Congratulations on being a member</p>

      <div>
        <h2>Member list</h2>
        <table className="card">
          <thead>
            <tr>
              <th>Address</th>
              <th>Token Amount</th>
            </tr>
          </thead>
          <tbody>
            {memberList.map((member) => {
              return (
                <tr key={member.address}>
                  <td>{shortenAddress(member.address)}</td>
                  <td>{member.tokenAmount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Shorten and obfuscate wallet address
const shortenAddress = (addr) => {
  return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
};
