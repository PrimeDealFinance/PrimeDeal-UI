#/bin/bash

echo "Deploying contract..."
# forge create \
#     --rpc-url 'https://lb.drpc.org/ogrpc?network=polygon-mumbai&dkey=AmvHqebJ6k7ThQWeGwnLVmnsDTC3hx0R7qTGrkUU-y5L' \
#     --private-key '0xe713b29254fcbfa701a7210983075d4813eeedf6e5b22551e354a7b40e44c9c9' \
#     --constructor-args 0xC36442b4a4522E871399CD717aBDD847Ab11FE88 0x1F98431c8aD98523631AE4a59f267346ea31F984 \
#     --verify \
#     --legacy \
#     --etherscan-api-key 'R93KQB2UG493H148YUSDFQH9498RV9AJIJ' \
#     --json \
#     --silent \
#     src/PositionManager.sol:PositionManager | tee script/out.txt

# if [ $? -eq 0 ]; then
#     echo "DONE"
# else
#     echo "FAIL"
#     exit 1
# fi

# echo "Extracting deployedTo address..."
# OUTPUT_FILE="script/contract_deploy_address.txt"
# DEPLOY_ENV_FILE="script/deploy.env"
# cat script/out.txt | head -n 1 | jq '.deployedTo' | tee $OUTPUT_FILE
# echo "CONTRACT_ADDRESS=$(cat $OUTPUT_FILE | tr -d '\"')" > $DEPLOY_ENV_FILE

echo "CONTRACT_ADDRESS=0xABCDEF" > $DEPLOY_ENV_FILE
echo "Done"