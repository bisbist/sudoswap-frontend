import React from "react";
import { ethers } from "ethers";
import config from "../config";
import { HotkeysProvider } from "@blueprintjs/core";
import {
  Column,
  Table2 as Table,
  Cell,
  EditableCell2 as EditableCell,
} from "@blueprintjs/table";

import "@blueprintjs/table/lib/css/table.css";
// import "@blueprintjs/popover2/lib/css/blueprint-popover2.cs";

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
      .then(async (pairs) => {
        setPairs(pairs);
      });
  }, []);

  const columns = [
    "timestamp",
    "blockNumber",
    "address",
    "variant",
    "ethBalance",
    "token",
    "tokenBalance",
    "spotPrice",
    "delta",
    "fee",
    "poolType",
    "nft",
    "owner",
    "bondingCurve",
    "assetRecipient",
    "logIndex",
    "txType",
    "txHash",
    "txIndex",
    "txValue",
    "txNonce",
    "txGasLimit",
    "txGasPrice",
    "txMaxFeePerGas",
    "txMaxPriorityFeePerGas",
  ];

  const getRowValue = (rowIndex, columnIndex) => {
    const key = columns[columnIndex];
    return pairs[rowIndex][key];
  };

  const defaultCellRenderer = (rowIndex, columnIndex) => {
    const value = getRowValue(rowIndex, columnIndex);
    return <Cell>{value}</Cell>;
  };

  const valueCellRenderer = (rowIndex, columnIndex) => {
    const value = getRowValue(rowIndex, columnIndex);
    if (!value) return <Cell></Cell>;
    return <Cell>{ethers.utils.formatEther(value)}</Cell>;
  };

  const gweiCellRenderer = (rowIndex, columnIndex) => {
    const value = getRowValue(rowIndex, columnIndex);
    return <Cell>{ethers.utils.formatUnits(value, "gwei") + " gwei"}</Cell>;
  };

  const timestampCellRender = (rowIndex, columnIndex) => {
    const value = getRowValue(rowIndex, columnIndex);
    return <Cell>{new Date(parseInt(value) * 1000).toLocaleString()}</Cell>;
  };

  const variantCellRenderer = (rowIndex, columnIndex) => {
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
  };

  const poolTypeCellRenderer = (rowIndex, columnIndex) => {
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
  };

  const spotPriceCellRenderer = (rowIndex, columnIndex) => {
    const value = getRowValue(rowIndex, columnIndex);
    if (!value) return <Cell></Cell>;
    return (
      <EditableCell
        isFocused
        value={value}
        onCancel={(value) => {

          console.error(value);
        }}
        onChange={(value) => {
          console.log(value);
        }}
        onConfirm={(value) => {
          // create transaction to update spot price
          console.log(value);
        }}
      />
    );
  };

  return (
    <div style={{ height: 500 }}>

      <HotkeysProvider>
        <Table numRows={pairs.length}>
          <Column name="Time" cellRenderer={timestampCellRender} />
          <Column name="Block" cellRenderer={defaultCellRenderer} />
          <Column name="Address" cellRenderer={defaultCellRenderer} />
          <Column name="Variant" cellRenderer={variantCellRenderer} />
          <Column name="ETH Balance" cellRenderer={valueCellRenderer} />
          <Column name="Token" cellRenderer={defaultCellRenderer} />
          <Column name="Token Balance" cellRenderer={valueCellRenderer} />
          <Column name="Spot Price" cellRenderer={valueCellRenderer} />
          <Column name="Delta" cellRenderer={valueCellRenderer} />
          <Column name="Fee" cellRenderer={valueCellRenderer} />
          <Column name="Type" cellRenderer={defaultCellRenderer} />
          <Column name="NFT" cellRenderer={defaultCellRenderer} />
          <Column name="Owner" cellRenderer={defaultCellRenderer} />
          <Column name="Bonding Curve" cellRenderer={defaultCellRenderer} />
          <Column name="Asset Recipient" cellRenderer={defaultCellRenderer} />
          <Column name="LogIndex" cellRenderer={defaultCellRenderer} />
          <Column name="TxType" cellRenderer={defaultCellRenderer} />
          <Column name="TxHash" cellRenderer={defaultCellRenderer} />
          <Column name="TxIndex" cellRenderer={defaultCellRenderer} />
          <Column name="TxValue" cellRenderer={valueCellRenderer} />
          <Column name="TxNonce" cellRenderer={defaultCellRenderer} />
          <Column name="TxGasLimit" cellRenderer={defaultCellRenderer} />
          <Column name="TxGasPrice" cellRenderer={gweiCellRenderer} />
          <Column name="TxMaxFeePerGas" cellRenderer={gweiCellRenderer} />
          <Column
            name="TxMaxPriorityFeePerGas"
            cellRenderer={gweiCellRenderer}
          />
        </Table>
      </HotkeysProvider>
    </div>
  );

};

export default PoolsTable;
