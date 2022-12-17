import { ethers } from "ethers";
import { provider, contracts } from "../../envionment.js";
import Pair, { Variant } from "./schema.js";

const fetchPairDetailsAndSave = async (event) => {
  const address = event.args.poolAddress;

  const contract = contracts.Pair(address);
  const variant = await contract.pairVariant();

  let token, tokenBalancePromise;
  if (
    [Variant.ENUMERABLE_ERC20, Variant.MISSING_ENUMERABLE_ERC20].includes(
      variant.toString()
    )
  ) {
    const erc20Pair = new ethers.Contract(
      address,
      ["function token() public view returns (address)"],
      provider
    );
    token = await erc20Pair.token();
    tokenBalancePromise = contracts.ERC20(token).balanceOf(address);
  }

  const [
    spotPrice,
    delta,
    fee,
    assetRecipient,
    bondingCurve,
    nft,
    poolType,
    { timestamp },
    {
      type: txType,
      from: owner,
      nonce: txNonce,
      value: txValue,
      gasLimit: txGasLimit,
      gasPrice: txGasPrice,
      maxFeePerGas: txMaxFeePerGas,
      maxPriorityFeePerGas: txMaxPriorityFeePerGas,
    },
    ethBalance,
    tokenBalance,
  ] = await Promise.all([
    contract.spotPrice(),
    contract.delta(),
    contract.fee(),
    contract.assetRecipient(),
    contract.bondingCurve(),
    contract.nft(),
    contract.poolType(),
    event.getBlock(),
    event.getTransaction(),
    provider.getBalance(address),
    tokenBalancePromise,
  ]);
  let pair = await Pair.findOne({ address });
  if (!pair) {
    const {
      blockNumber,
      transactionHash: txHash,
      transactionIndex: txIndex,
      logIndex,
    } = event;
    pair = new Pair({
      address,
      spotPrice,
      delta,
      fee,
      assetRecipient,
      bondingCurve,
      nft,
      poolType,
      variant,
      owner,
      token,
      tokenBalance,
      ethBalance,
      blockNumber,
      logIndex,
      txType,
      txHash,
      txIndex,
      timestamp,
      txValue,
      txNonce,
      txGasLimit,
      txGasPrice,
      txMaxFeePerGas,
      txMaxPriorityFeePerGas,
    });
  }

  await pair.save();
};

// fetch existing NewPair events from blockchain
const fetchMissingPairs = async (db) => {
  const pairs = await Pair.find().sort({ blockNumber: -1 }).limit(1);

  const blockNumber = Math.max(
    pairs.length > 0 ? pairs[0].blockNumber : 0,
    (await provider.getBlockNumber()) - 2500
  ); // - 3015)

  const factoryContract = contracts.PairFactory();

  const events = await factoryContract.queryFilter(
    factoryContract.filters.NewPair(),
    blockNumber,
    null
  );

  for (let event of events) {
    await fetchPairDetailsAndSave(event);
  }
};

const fetchPairUpdates = (db) => {
  fetchMissingPairs();

  const pairContract = contracts.Pair();
  const factoryContract = contracts.PairFactory();

  factoryContract.on(
    factoryContract.filters.NewPair(), // on NewPair event
    async (poolAddress, event) => {
      await fetchPairDetailsAndSave(event);
    }
  );

  const eventHandlers = [
    {
      filter: pairContract.filters.SpotPriceUpdate(), // spotPrice
      handle: async (event) => {
        const pair = await Pair.findOne({ address: event.address });
        if (pair) {
          const contract = contracts.Pair(pair.address);
          pair.spotPrice = await contract.spotPrice();
          await pair.save();
        }
      },
    },
    {
      filter: pairContract.filters.TokenDeposit(), // token balance
      handle: async (event) => {
        console.log("deposit", event)
        const pair = await Pair.findOne({ address: event.address });
        if (pair) {
          pair.ethBalance = await provider.getBalance(pair.address);
          if (pair.variant === Variant.ENUMERABLE_ERC20 || pair.variant === Variant.MISSING_ENUMERABLE_ERC20) {
            const erc20 = contracts.ERC20(pair.token)
            pair.tokenBalance = await erc20.balanceOf(pair.address)
          }
          await pair.save();
        }
      },
    },
    {
      filter: pairContract.filters.TokenWithdrawal(), // token balance
      handle: async (event) => {
        console.log("withdraw", event)
        const pair = await Pair.findOne({ address: event.address });
        if (pair) {
          pair.ethBalance = await provider.getBalance(pair.address);
          if (pair.variant === Variant.ENUMERABLE_ERC20 || pair.variant === Variant.MISSING_ENUMERABLE_ERC20) {
            const erc20 = contracts.ERC20(pair.token)
            pair.tokenBalance = await erc20.balanceOf(pair.address)
          }
          await pair.save();
        }
      },
    },
    {
      filter: pairContract.filters.NFTWithdrawal(), // nft balance
      handle: async (event) => {
        console.log("NFTWithdrawal", event);
      },
    },
    {
      filter: pairContract.filters.DeltaUpdate(), // delta
      handle: async (event) => {
        const pair = await Pair.findOne({ address: event.address });
        if (pair) {
          const contract = contracts.Pair(pair.address);
          pair.delta = await contract.delta();
          await pair.save();
        }
      },
    },
    {
      filter: pairContract.filters.FeeUpdate(), // fee
      handle: async (event) => {
        const pair = await Pair.findOne({ address: event.address });
        if (pair) {
          const contract = contracts.Pair(pair.address);
          pair.fee = await contract.fee();
          await pair.save();
        }
      },
    },
    {
      filter: pairContract.filters.AssetRecipientChange(), // assetRecipient
      handle: async (event) => {
        const pair = await Pair.findOne({ address: event.address });
        if (pair) {
          const contract = contracts.Pair(pair.address);
          pair.assetRecipient = await contract.assetRecipient();
          await pair.save();
        }
      },
    },
  ];

  eventHandlers.forEach((evh) => {
    provider.on({ ...evh.filter, address: null }, async (...events) => {
      await Promise.all(
        events.map(async (event) => {
          const pair = await Pair.findOne({ address: event.address });
          const evh = eventHandlers.find((ecb) => {
            return ecb.filter.topics[0] == event.topics[0];
          });
          if (!!pair && !!evh) return await evh.handle(event);
        })
      );
    });
  });
};

export { Pair, fetchPairUpdates };
