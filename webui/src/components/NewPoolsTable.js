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

  const cellRenderer = (rowIndex, columnIndex) => {
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

  const sportPriceCellRenderer = (rowIndex, columnIndex) => {
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
          <Column name="Block" cellRenderer={cellRenderer} />
          <Column name="Address" cellRenderer={cellRenderer} />
          <Column name="Variant" cellRenderer={variantCellRenderer} />
          <Column name="ETH Balance" cellRenderer={valueCellRenderer} />
          <Column name="Token" cellRenderer={cellRenderer} />
          <Column name="Token Balance" cellRenderer={valueCellRenderer} />
          <Column name="Spot Price" cellRenderer={valueCellRenderer} />
          <Column name="Delta" cellRenderer={valueCellRenderer} />
          <Column name="Fee" cellRenderer={valueCellRenderer} />
          <Column name="Type" cellRenderer={cellRenderer} />
          <Column name="NFT" cellRenderer={cellRenderer} />
          <Column name="Owner" cellRenderer={cellRenderer} />
          <Column name="Bonding Curve" cellRenderer={cellRenderer} />
          <Column name="Asset Recipient" cellRenderer={cellRenderer} />
          <Column name="LogIndex" cellRenderer={cellRenderer} />
          <Column name="TxType" cellRenderer={cellRenderer} />
          <Column name="TxHash" cellRenderer={cellRenderer} />
          <Column name="TxIndex" cellRenderer={cellRenderer} />
          <Column name="TxValue" cellRenderer={valueCellRenderer} />
          <Column name="TxNonce" cellRenderer={cellRenderer} />
          <Column name="TxGasLimit" cellRenderer={cellRenderer} />
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

  return (
    <div style={{ overflow: "auto" }}>
      <table style={{ padding: 10 }}>
        <thead>
          <tr>
            <th style={{ minWidth: 200 }}>Time</th>
            <th>Block</th>
            <th>Address</th>
            <th>Variant</th>
            <th>ETH Balance</th>
            <th>Token</th>
            <th>Token Balance</th>
            <th>Spot Price</th>
            <th>Delta</th>
            <th>Fee</th>
            <th>Type</th>
            <th>NFT</th>
            <th>Owner</th>
            <th>Bonding Curve</th>
            <th>Asset Recipient</th>
            <th>LogIndex</th>
            <th>TxType</th>
            <th>TxHash</th>
            <th>TxIndex</th>
            <th>TxValue</th>
            <th>TxNonce</th>
            <th>TxGasLimit</th>
            <th>TxGasPrice</th>
            <th>TxMaxFeePerGas</th>
            <th>TxMaxPriorityFeePerGas</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => {
            return (
              <tr key={index}>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.timestamp}</td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.blockNumber}</td>
                <td
                  style={{ padding: "0 10px 0 10px", cursor: "pointer" }}
                  onClick={(event) => {
                    onPairClick(pair.address);
                  }}
                >
                  <tt>{pair.address}</tt>
                </td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.variant}</td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.ethBalance}</td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.token}</td>
                <td style={{ padding: "0 10px 0 10px" }}>
                  {pair.tokenBalance}
                </td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.spotPrice}</td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.delta}</td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.fee}</td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.poolType}</td>
                <td style={{ padding: "0 10px 0 10px" }}>
                  <tt>{pair.nft}</tt>
                </td>
                <td style={{ padding: "0 10px 0 10px" }}>
                  <tt>{pair.owner}</tt>
                </td>
                <td style={{ padding: "0 10px 0 10px" }}>
                  <tt>{pair.bondingCurve}</tt>
                </td>
                <td style={{ padding: "0 10px 0 10px" }}>
                  <tt>{pair.assetRecipient}</tt>
                </td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.logIndex}</td>
                <td style={{ padding: "0 10px 0 10px" }}>
                  <tt>{pair.txType}</tt>
                </td>
                <td style={{ padding: "0 10px 0 10px" }}>
                  <tt>{pair.txHash}</tt>
                </td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.txIndex}</td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.txValue}</td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.txNonce}</td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.txGasLimit}</td>
                <td style={{ padding: "0 10px 0 10px" }}>{pair.txGasPrice}</td>
                <td style={{ padding: "0 10px 0 10px" }}>
                  {pair.txMaxFeePerGas}
                </td>
                <td style={{ padding: "0 10px 0 10px" }}>
                  {pair.txMaxPriorityFeePerGas}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PoolsTable;
