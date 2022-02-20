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

const voteModule = sdk.getVoteModule(
  "0xa8c510944a923F8ED225ef47965f59e7A12CFe16"
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

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

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

  const getProposals = async () => {
    try {
      const proposals = await voteModule.getAll();
      setProposals(proposals);
      console.log("Proposals: ", proposals);
    } catch (error) {
      console.log("Failed to get proposals", error);
    }
  };

  const hasUserVoted = useCallback(async () => {
    try {
      const proposalId = proposals[0].proposalId;
      const hasVoted = await voteModule.hasVoted(
        proposals[0].proposalId,
        address
      );
      setHasVoted(hasVoted);
      if (hasVoted) {
        console.log(`User has already voted on proposal ${proposalId}`);
      } else {
        console.log(`User has not voted yet on proposal ${proposalId}`);
      }
    } catch (error) {
      console.error(`Failed to check if wallet has voted ${error}`);
    }
  }, [address, proposals]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    getNftMemberAddresses();
    getMemberTokenBalances();
    getProposals();
  }, [hasClaimedNFT]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    if (!proposals.length) {
      return;
    }

    hasUserVoted();
  }, [hasClaimedNFT, hasUserVoted, proposals]);

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

  const onVoteFormSumbit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Disable voting button
    setIsVoting(true);

    // Get form values
    const votes = proposals.map((proposal) => {
      const voteResult = {
        proposalId: proposal.proposalId,
        // Abstain by default
        vote: 2,
      };
      proposal.votes.forEach((vote) => {
        const voteFormElem = document.getElementById(
          `${proposal.proposalId}-${vote.type}`
        );

        if (voteFormElem.checked) {
          voteResult.vote = vote.type;
          return;
        }
      });

      return voteResult;
    });

    // Make sure user delegates their tokens to vote
    try {
      // Check if wallet needs to delegate tokens to vote or if its already done
      const delegation = await tokenModule.getDelegationOf(address);
      // If the delegation is 0x0, wallet has not yet delegated governance tokens
      if (delegation === ethers.constants.AddressZero) {
        // Prompt to delegate tokens
        await tokenModule.delegateTo(address);
      }

      try {
        await Promise.all(
          votes.map(async (vote) => {
            const proposal = await voteModule.get(vote.proposalId);
            // Check if proposal is open for voting
            if (proposal.state === 1) {
              // If open, then vote on it
              return voteModule.vote(vote.proposalId, vote.vote);
            }
            return;
          })
        );
      } catch (err) {
        console.error("Error voting on proposal ", err);
      }

      try {
        // Check if any proposal is ready to be executed
        await Promise.all(
          votes.map(async (vote) => {
            const proposal = await voteModule.get(vote.proposalId);

            // Proposal is ready to be executed
            if (proposal.state === 4) {
              // Perform proposal execution
              return voteModule.execute(vote.proposalId);
            }
          })
        );

        setHasVoted(true);

        console.log("Successfully voted");
      } catch (err) {
        console.error("Error executing proposal ", err);
      }
    } catch (error) {
      console.error("Failed to delegate tokens");
    } finally {
      setIsVoting(false);
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
        <div>
          <h2>Active Proposals</h2>
          <form onSubmit={onVoteFormSumbit}>
            {proposals.map((proposal, index) => (
              <div key={proposal.proposalId} className="card">
                <h5>{proposal.description}</h5>
                <div>
                  {proposal.votes.map((vote) => (
                    <div key={vote.type}>
                      <input
                        type="radio"
                        id={`${proposal.proposalId}-${vote.type}`}
                        name={proposal.proposalId}
                        value={vote.type}
                        defaultChecked={vote.type === 2}
                      />
                      <label htmlFor={`${proposal.proposalId}-${vote.type}`}>
                        {vote.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button disabled={isVoting || hasVoted} type="submit">
              {isVoting
                ? "Voting..."
                : hasVoted
                ? "You already voted"
                : "Submit votes"}
            </button>
            <small>
              This will trigger multiple transactions that you will need to sign
            </small>
          </form>
        </div>
      </div>
    </div>
  );
}

// Shorten and obfuscate wallet address
const shortenAddress = (addr) => {
  return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
};
