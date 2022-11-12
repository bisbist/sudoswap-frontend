#!/bin/bash
# Generate env file from the address located in lssvm repo

lssvm_repo=${2:-"../../lssvm"}

addrs="$lssvm_repo/out/addresses.json"
addrs_extra="$lssvm_repo/out/addresses_extra.json"
src_env="$lssvm_repo/.env"
dst_env="./.env"
tmp_env=$(mktemp)

rpc_call() {
    local url=$1    # rpc url
    local method=$2 # rpc call method
    local params=$3 # json array of arguments
    curl -X POST $url -s \
        -H "Content-Type: application/json" \
        --data "{\"id\":1,\"jsonrpc\":\"2.0\",\"method\":\"$method\",\"params\":$params}" \
        | jq -r .result
}

source $src_env

echo -n "" > $tmp_env
RPC_URL="${ETH_RPC_URL:-http://127.0.0.1:8545}"

echo "CHAIN_ID=$(rpc_call $RPC_URL eth_chainId [])" >> $tmp_env
echo "CHAIN_NAME=${CHAIN_NAME}" >> $tmp_env
echo "CHAIN_RPC_URL=$RPC_URL" >> $tmp_env
echo "CHAIN_CURRENCY_SYMBOL=${SYMBOL:-ETH}" >> $tmp_env
echo "DEPLOYER=$(jq -r .DEPLOYER $addrs)" >> $tmp_env
echo "ROUTER=$(jq -r .LSSVMRouter $addrs)" >> $tmp_env
echo "PAIR_FACTORY=$(jq -r .LSSVMPairFactory $addrs)" >> $tmp_env
echo "LINEAR_CURVE=$(jq -r .LinearCurve $addrs)" >> $tmp_env
echo "EXPONENTIAL_CURVE=$(jq -r .ExponentialCurve $addrs)" >> $tmp_env
echo "TEST_ERC20=$(jq -r .Test20 $addrs_extra)" >> $tmp_env
echo "TEST_ERC721=$(jq -r .Test721BatchMintWithRoyalty $addrs_extra)" >> $tmp_env
echo "TEST_ERC721_ENUMERABLE=$(jq -r .Test721EnumerableBatchMintWithRoyalty $addrs_extra)" >> $tmp_env
echo "ROYALTY_ROUTER=$(jq -r .LSSVMRouterWithRoyalties $addrs_extra)" >> $tmp_env
echo "ROYALTY_REGISTRY=$(jq -r .RoyaltyRegistry $addrs_extra)" >> $tmp_env
echo "MONGODB_URI=${MONGODB_URI}" >> $tmp_env

# update dst env if changed
if [ "$(diff $tmp_env $dst_env | wc -l)" != "0" ]; then
    cp $dst_env $dst_env.bak # back prev env file
    mv $tmp_env $dst_env
fi