import React from 'react'
import { ethers } from 'ethers'
import { provider, contracts, getDefaultTxnParams } from '../../environment'
import SwapList from './components/SwapList'


const RobustSwapERC20ForAnyNFTs = ({
  router: { name: routerName, createContract: createRouterContract },
}) => {
  const [swapList, setSwapList] = React.useState([]); // PairSwapAny[] swapList
  const [nftRecipient, setNFTRecipient] = React.useState(""); // address nftRecipient
  const [deadline, setDeadline] = React.useState("0"); // uint256 deadline
  const [amount, setAmount] = React.useState("0"); // uint256 deadline

  return (
    <div>
      <table
        style={{
          margin: 5,
          minWidth: 500,
          // border: 'solid', borderWidth: 1, borderColor: "red"
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "30%" }} />
            <th style={{ width: "70%" }} />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>NFT Recipient</td>
            <td>
              <input
                style={{ width: "97.5%" }}
                value={nftRecipient}
                onChange={(event) => setNFTRecipient(event.target.value)}
              />
            </td>
          </tr>

          <tr>
            <td>Deadline</td>
            <td>
              <input
                style={{ width: "97.5%" }}
                type="number"
                step={1}
                min={5}
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </td>
          </tr>

          <tr>
            <td>Input Amount</td>
            <td>
              <input
                style={{ width: "97.5%" }}
                type="number"
                step={0.001}
                min={0}
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <SwapList
        type="RobustPairSwapAny"
        swapList={swapList}
        onChange={(swapList) => {
          console.log(swapList);
          setSwapList(swapList);
        }}
      />

      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={async () => {
            // connect specific metamask wallet with this site\
            await provider.send("eth_requestAccounts");

            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            console.log("This is signer address", signerAddress);

            const router = createRouterContract(signer);

            // create a params object with correct values to be used as swap
            // transaction arguments
            const params = {
              deadline: Date.now() + Math.floor(1000 * parseFloat(deadline)),
              nftRecipient:
                nftRecipient != "" ? nftRecipient : await signer.getAddress(),
              swapList: swapList.map(function (swap) {
                return [
                  [swap.swapInfo.pair, swap.swapInfo.numItems],
                  ethers.utils.parseEther(swap.maxCost),
                ];
              }),
              amount: ethers.utils.parseEther(amount),
            };

            // console.log("code reached here...")

            // ensure that all pairs have same ERC20 token
            const getTokenAddr = async (swap) => {
              const pair = new ethers.Contract(
                swap.swapInfo.pair,
                ["function token() public pure returns (address _token)"],
                provider
              );
              return await pair.token();
            };
            const promises = swapList.map(getTokenAddr);
            const tokenAddrs = await Promise.all(promises);
            let set = new Set(tokenAddrs);
            if (set.size > 1) {
              // tokenAddrs.values().map()
              alert(
                "Please ensure swapList contains pairs of a single ERC20 token!"
              );
              return;
            }

            // Approve router to access ERC20 token of the pairs
            const tokenAddr = tokenAddrs[0];
            const erc20 = contracts.ERC20(tokenAddr, signer);
            let txn = await erc20.approve(router.address, params.amount);
            await txn.wait();

            // Create a swap transaction
            txn = await router.robustSwapERC20ForAnyNFTs(
              params.swapList,
              params.amount,
              params.nftRecipient,
              params.deadline,
              {
                ...getDefaultTxnParams(),
              }
            );

            await txn.wait();
          }}
        >
          Send Transaction!
        </button>
      </div>
    </div>
  );
};

export default RobustSwapERC20ForAnyNFTs