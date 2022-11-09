#!/bin/bash
# Generate env file from the address located in lssvm repo

lssvm_repo=${2:-"../../lssvm"}

addrs="$lssvm_repo/out/addresses.json"
addrs_extra="$lssvm_repo/out/addresses_extra.json"

env_file="./.env"
cp $env_file "$env_file.bak"

echo -n "" > $env_file

echo "CHAIN_ID=0x7a69" >> $env_file
echo "CHAIN_NAME=Localhost8545" >> $env_file
echo "CHAIN_RPC_URL=http://127.0.0.1:8545" >> $env_file
echo "CHAIN_CURRENCY_SYMBOL=ETH" >> $env_file
echo "DEPLOYER=$(jq -r .DEPLOYER $addrs)" >> $env_file
echo "ROUTER=$(jq -r .LSSVMRouter $addrs)" >> $env_file
echo "PAIR_FACTORY=$(jq -r .LSSVMPairFactory $addrs)" >> $env_file
echo "LINEAR_CURVE=$(jq -r .LinearCurve $addrs)" >> $env_file
echo "EXPONENTIAL_CURVE=$(jq -r .ExponentialCurve $addrs)" >> $env_file
echo "TEST_ERC20=$(jq -r .Test20 $addrs_extra)" >> $env_file
echo "TEST_ERC721=$(jq -r .Test721BatchMintWithRoyalty $addrs_extra)" >> $env_file
echo "TEST_ERC721_ENUMERABLE=$(jq -r .Test721EnumerableBatchMintWithRoyalty $addrs_extra)" >> $env_file
echo "ROYALTY_ROUTER=$(jq -r .LSSVMRouterWithRoyalties $addrs_extra)" >> $env_file
echo "ROYALTY_REGISTRY=0xaD2184FB5DBcfC05d8f056542fB25b04fa32A95D" >> $env_file







