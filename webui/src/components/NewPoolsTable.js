import React, { useCallback } from "react";
import { BigNumber, ethers } from "ethers";
import { provider, contracts, getDefaultTxnParams } from "../environment";

import { HotkeysProvider } from "@blueprintjs/core";
import {
  Column,
  Table2 as Table,
  Cell,
  EditableCell2 as EditableCell,
} from "@blueprintjs/table";

import "@blueprintjs/table/lib/css/table.css";

export const Type = {
  TOKEN: "0",
  NFT: "1",
  TRADE: "2",
};

export const Variant = {
  ENUMERABLE_ETH: "0",
  MISSING_ENUMERABLE_ETH: "1",
  ENUMERABLE_ERC20: "2",
  MISSING_ENUMERABLE_ERC20: "3",
};

const PoolsTable = ({ onPairClick }) => {
  const [pairs, setPairs] = React.useState([]);

  React.useEffect(() => {
    fetch("/pairs")
      .then((results) => results.json())
      .then(setPairs);
  }, []);

  const defaultCellRenderer = useCallback((rowIndex, columnIndex) => {
    const value = getRowValue(rowIndex, columnIndex);
    return <Cell>{value}</Cell>;
  });

  const valueCellRenderer = useCallback((rowIndex, columnIndex) => {
    const value = getRowValue(rowIndex, columnIndex);
    if (!value) return <Cell></Cell>;
    return <Cell>{ethers.utils.formatEther(value)}</Cell>;
  });

  const gweiCellRenderer = useCallback((rowIndex, columnIndex) => {
    const value = getRowValue(rowIndex, columnIndex);
    return <Cell>{ethers.utils.formatUnits(value, "gwei") + " gwei"}</Cell>;
  });

  const timestampCellRender = useCallback((rowIndex, columnIndex) => {
    const value = getRowValue(rowIndex, columnIndex);
    return <Cell>{new Date(parseInt(value) * 1000).toLocaleString()}</Cell>;
  });

  const variantCellRenderer = useCallback((rowIndex, columnIndex) => {
    const variant = getRowValue(rowIndex, columnIndex);

    const value =
      variant === Variant.ENUMERABLE_ETH
        ? "ETH_ENUM"
        : variant === Variant.MISSING_ENUMERABLE_ETH
        ? "ETH"
        : variant === Variant.ENUMERABLE_ERC20
        ? "ERC20_ENUM"
        : variant === Variant.MISSING_ENUMERABLE_ERC20
        ? "ERC20"
        : "UNKNOWN";

    return <Cell>{value}</Cell>;
  });

  const poolTypeCellRenderer = useCallback((rowIndex, columnIndex) => {
    const poolType = getRowValue(rowIndex, columnIndex);

    const value =
      poolType === Type.TOKEN
        ? "TOKEN"
        : poolType === Type.NFT
        ? "NFT"
        : poolType === Type.TRADE
        ? "TRADE"
        : "UNKNOWN";

    return <Cell>{value}</Cell>;
  });

  const sdfCellRenderer = useCallback((sdf) => {
    const isSpotPriceCell = sdf === "spotPrice";
    const isDeltaCell = sdf === "delta";
    const isFeeCell = sdf === "fee";

    return (rowIndex, columnIndex) => {
      const value = getRowValue(rowIndex, columnIndex);

      if (!value) return <Cell></Cell>;

      const valueText = ethers.utils.formatEther(value);

      if (isFeeCell) {
        const index = getColumnIndex("poolType");
        const poolType = getRowValue(rowIndex, index);
        if (poolType !== Type.TRADE) {
          return <Cell>{valueText}</Cell>;
        }
      }

      return (
        <EditableCell
          value={valueText}
          onCancel={console.error}
          onChange={console.log}
          onConfirm={async (newValueText) => {
            // create transaction to update fee
            const ownerColumnIndex = getColumnIndex("owner");
            const poolAddressColumnIndex = getColumnIndex("address");

            if (ownerColumnIndex >= 0) {
              const owner = getRowValue(rowIndex, ownerColumnIndex);
              const poolAddress = getRowValue(rowIndex, poolAddressColumnIndex);
              await provider.send("eth_requestAccounts");
              const signer = provider.getSigner();
              const signerAddress = await signer.getAddress();

              if (owner != signerAddress) {
                alert(`Please provide correct owner address = ${owner}`);
              } else {
                const pair = contracts.pair(poolAddress, signer);
                let txn;
                const newValue = ethers.utils.parseEther(newValueText);
                if (newValue != value) {
                  if (isSpotPriceCell) {
                    txn = await pair.changeSpotPrice(newValue);
                  } else if (isDeltaCell) {
                    txn = await pair.changeDelta(newValue);
                  } else if (isFeeCell) {
                    txn = await pair.changeFee(newValue);
                  }
                }
                if (txn !== undefined) await txn.wait();
              }
            }
          }}
        />
      );
    };
  });

  const ethOrTokenBalanceCellRenderer = useCallback((et) => {
    const isETHCell = et === "eth";
    const isERC20Cell = et === "token";

    return (rowIndex, columnIndex) => {
      const value = getRowValue(rowIndex, columnIndex);

      if (!value) return <Cell></Cell>;

      const valueText = ethers.utils.formatEther(value);

      const variantColumnIndex = getColumnIndex("variant");
      const variant = getRowValue(rowIndex, variantColumnIndex);

      const tokenColumnIndex = getColumnIndex("token");
      const tokenAddress = getRowValue(rowIndex, tokenColumnIndex);

      const isETHVariant =
        variant == Variant.ENUMERABLE_ETH ||
        variant == Variant.MISSING_ENUMERABLE_ETH;
      const isERC20Variant =
        variant == Variant.ENUMERABLE_ERC20 ||
        variant == Variant.MISSING_ENUMERABLE_ERC20;

      if ((isETHCell && !isETHVariant) || (isERC20Cell && !isERC20Variant)) {
        return <Cell>{valueText}</Cell>;
      }

      return (
        <EditableCell
          value={valueText}
          onCancel={console.error}
          onConfirm={async (newValueText) => {
            await provider.send("eth_requestAccounts");
            const signer = provider.getSigner();

            const poolAddressColumnIndex = getColumnIndex("address");
            const poolAddress = getRowValue(rowIndex, poolAddressColumnIndex);

            const deltaValue = ethers.utils.parseEther(newValueText).sub(value);

            // anyone can deposit funds
            if (deltaValue.gt(BigNumber.from(0))) {
              let tx;
              if (isETHCell) {
                tx = await signer.sendTransaction({
                  to: poolAddress,
                  value: deltaValue.abs(),
                });
              } else {
                const erc20 = contracts.ERC20(tokenAddress, signer);
                tx = await erc20.approve(poolAddress, deltaValue.abs());
                await tx.wait();

                const pair = new ethers.Contract(
                  poolAddress,
                  ["function depositERC20(address a, uint256 amount);"],
                  signer
                );
                tx = await pair.depositERC20(tokenAddress, deltaValue.abs(), { ...getDefaultTxnParams() });
              }
              await tx.wait();
              return;
            }

            if (deltaValue.lt(BigNumber.from(0))) {
              // owner can withdraw funds
              const ownerColumnIndex = getColumnIndex("owner");
              const owner = getRowValue(rowIndex, ownerColumnIndex);
              const signerAddress = await signer.getAddress();
              if (signerAddress != owner) {
                alert(`Only owner=${owner} can withdraw pool balance!`);
                return;
              }
              const pair = new ethers.Contract(
                poolAddress,
                [
                  "function withdrawETH(uint256 amount) public;",
                  "function withdrawERC20(address a, uint256 amount);",
                ],
                signer
              );
              let tx;
              if (isETHCell) {
                tx = await pair.withdrawETH(deltaValue.abs());
              } else {
                tx = await pair.withdrawERC20(tokenAddress, deltaValue.abs());
              }
              await tx.wait();
            }
          }}
        />
      );
    };
  });

  const columns = [
    { name: "Time", key: "timestamp", renderer: timestampCellRender },
    { name: "Block", key: "blockNumber", renderer: defaultCellRenderer },
    { name: "Address", key: "address", renderer: defaultCellRenderer },
    { name: "Variant", key: "variant", renderer: variantCellRenderer },
    {
      name: "ETH Balance",
      key: "ethBalance",
      renderer: ethOrTokenBalanceCellRenderer("eth"),
    },
    { name: "Token", key: "token", renderer: defaultCellRenderer },
    {
      name: "Token Balance",
      key: "tokenBalance",
      renderer: ethOrTokenBalanceCellRenderer("token"),
    },
    {
      name: "Spot Price",
      key: "spotPrice",
      renderer: sdfCellRenderer("spotPrice"),
    },
    { name: "Delta", key: "delta", renderer: sdfCellRenderer("delta") },
    { name: "Fee", key: "fee", renderer: sdfCellRenderer("fee") },
    { name: "Type", key: "poolType", renderer: poolTypeCellRenderer },
    { name: "NFT", key: "nft", renderer: defaultCellRenderer },
    { name: "Owner", key: "owner", renderer: defaultCellRenderer },
    {
      name: "Bonding Curve",
      key: "bondingCurve",
      renderer: defaultCellRenderer,
    },
    {
      name: "Asset Recipient",
      key: "assetRecipient",
      renderer: defaultCellRenderer,
    },
    { name: "LogIndex", key: "logIndex", renderer: defaultCellRenderer },
    { name: "TxType", key: "txType", renderer: defaultCellRenderer },
    { name: "TxHash", key: "txHash", renderer: defaultCellRenderer },
    { name: "TxIndex", key: "txIndex", renderer: defaultCellRenderer },
    { name: "TxValue", key: "txValue", renderer: valueCellRenderer },
    { name: "TxNonce", key: "txNonce", renderer: defaultCellRenderer },
    { name: "TxGasLimit", key: "txGasLimit", renderer: gweiCellRenderer },
    { name: "TxGasPrice", key: "txGasPrice", renderer: gweiCellRenderer },
    {
      name: "TxMaxFeePerGas",
      key: "txMaxFeePerGas",
      renderer: gweiCellRenderer,
    },
    {
      name: "TxMaxPriorityFeePerGas",
      key: "txMaxPriorityFeePerGas",
      renderer: gweiCellRenderer,
    },
  ];

  const getRowValue = useCallback((rowIndex, columnIndex) => {
    const key = columns[columnIndex].key;
    return pairs[rowIndex][key];
  });

  const getColumnIndex = useCallback((key) => {
    return columns.findIndex((col) => col.key === key);
  });

  return (
    <div style={{ width: "95%", margin: "30px" }}>
      <HotkeysProvider>
        <Table numRows={pairs.length}>
          {columns.map(({ name, key, renderer }) => {
            return <Column key={key} name={name} cellRenderer={renderer} />;
          })}
        </Table>
      </HotkeysProvider>
    </div>
  );
};

export default PoolsTable;
